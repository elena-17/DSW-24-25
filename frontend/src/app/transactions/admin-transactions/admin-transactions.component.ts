import { Component, OnInit } from "@angular/core";
import { CommonModule, DatePipe } from "@angular/common";
import { MaterialModule } from "../../material.module";
import { ToolbarComponent } from "../../toolbar/toolbar.component";
import { TableComponent } from "../../shared/table/table.component";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { NotificationService } from "../../services/notification.service";
import { SliderComponent } from "../../shared/slider/slider.component";
import { MatBadgeModule } from "@angular/material/badge";
import { FormGroup, ReactiveFormsModule, FormBuilder } from "@angular/forms";
import { TransactionsService } from "../../services/transactions.service";
import { getTransactionColumns } from "../config/transactions-admin-columns.config";
import {
  MatNativeDateModule,
  provideNativeDateAdapter,
} from "@angular/material/core";
import {
  createFilters,
  resetFilters,
  hasActiveFilters,
} from "../config/filters.config";
import { DetailsTransactionComponent } from "../details-transaction/details-transaction.component";
import { MatDialog } from "@angular/material/dialog";
import * as Papa from "papaparse";
import { TransactionData } from "../config/transaction-state.config";
import { PageEvent } from "@angular/material/paginator";
import { CreateTransactionComponent } from "../create-transaction/create-transaction.component";

@Component({
  selector: "app-admin-transactions",
  providers: [DatePipe, provideNativeDateAdapter()],
  imports: [
    MaterialModule,
    CommonModule,
    ToolbarComponent,
    TableComponent,
    MatDatepickerModule,
    SliderComponent,
    MatBadgeModule,
    MatNativeDateModule,
    ReactiveFormsModule,
  ],
  templateUrl: "./admin-transactions.component.html",
  styleUrl: "./admin-transactions.component.scss",
})
export class AdminTransactionsComponent implements OnInit {
  loading: boolean = false;
  filterOpen: boolean = false;
  filtersForm!: FormGroup;
  columns: any[] = [];
  hasActiveFilters: boolean = false;
  currentTab: number = 0;

  transactionStates: { [key: string]: TransactionData } = {
    approved: { data: [], totalCount: 0, pageIndex: 0, pageSize: 5 },
    pending: { data: [], totalCount: 0, pageIndex: 0, pageSize: 5 },
    rejected: { data: [], totalCount: 0, pageIndex: 0, pageSize: 5 },
  };

  constructor(
    private transactionsService: TransactionsService,
    private datePipe: DatePipe,
    private notificationService: NotificationService,
    private dialog: MatDialog,
  ) {}

  ngOnInit() {
    console.log(this.currentTab);
    this.columns = getTransactionColumns(this.datePipe);
    this.initFilters();
    // this.loadTransactions(); //not necessary bc in ngAfterViewInit it calls filterData()
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.filtersForm.updateValueAndValidity();
      this.filterData();
    }, 0);
  }

  initFilters() {
    this.filtersForm = createFilters(new FormBuilder());
  }

  loadTransactionsByStatus(status: string, filters: any = {}) {
    const state = this.transactionStates[status];
    const offset = state.pageIndex * state.pageSize;
    const params = {
      ...filters,
      status,
      limit: state.pageSize.toString(),
      offset: offset.toString(),
    };
    this.loading = true;
    this.transactionsService.getAdminTransactions(params).subscribe({
      next: (res: any) => {
        state.data = res.results;
        state.totalCount = res.count;
      },
      error: (err) => {
        console.error(`Error loading ${status} transactions: `, err);
        this.notificationService.showErrorMessage(
          "Error loading transactions.",
        );
        this.loading = false;
      },
      complete: () => {
        this.loading = false;
      },
    });
  }
  openDetails(transaction: any) {
    transaction.formattedDate =
      this.datePipe.transform(
        new Date(transaction.created_at),
        "dd MMM yyyy, HH:mm",
      ) || "";
    const dialogRef = this.dialog.open(DetailsTransactionComponent, {
      data: transaction,
      width: "33%",
      height: "65%",
    });
  }

  approveTransaction(transaction: any) {
    this.updateTransaction(transaction, "approved");
  }

  rejectTransaction(transaction: any) {
    this.updateTransaction(transaction, "rejected");
  }

  pendTransaction(transaction: any) {
    this.updateTransaction(transaction, "pending");
  }

  updateTransaction(transaction: any, status: string) {
    this.transactionsService
      .updateAdminTransaction(transaction.id, status)
      .subscribe({
        next: (response) => {
          console.log(`Transaction ${status}`, response);
          this.notificationService.showSuccessMessage(`Transaction ${status}`);
          this.filterData();
        },
        error: (error) => {
          console.error(`Error updating transaction to ${status}: `, error);
          if (error.error && error.error.amount) {
            this.notificationService.showErrorMessage(`${error.error.amount}`);
          } else {
            this.notificationService.showErrorMessage(
              `Error updating transaction to ${status}.`,
            );
          }
        },
      });
  }

  createTransaction() {
    const dialogRef = this.dialog.open(CreateTransactionComponent, {
      data: { title: "Create Transaction", admin: true },
      width: "90%",
      height: "60%",
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.transactionsService
          .createAdminTransaction(
            result.sender,
            result.receiver,
            result.amount,
            result.title,
            result.type,
            result.description,
          )
          .subscribe({
            next: (response) => {
              console.log("Transaction created:", response);
              this.notificationService.showSuccessMessage(
                "Transaction created",
              );
              this.transactionStates["pending"].data = [
                response,
                ...this.transactionStates["pending"].data,
              ];
              this.transactionStates["pending"].totalCount++;
            },
            error: (error) => {
              console.error("Error creating transaction:", error);
              if (error.error && error.error.amount) {
                this.notificationService.showErrorMessage(
                  `${error.error.amount}`,
                );
              } else {
                this.notificationService.showErrorMessage(
                  "Error creating transaction.",
                );
              }
            },
          });
      }
    });
  }

  /// Filters Functions ///
  toggleFilters() {
    this.filterOpen = !this.filterOpen;
  }

  closeFilters() {
    this.filterOpen = false;
  }
  applyFilters() {
    this.filterData();
    this.closeFilters();
  }

  clearFilters() {
    resetFilters(this.filtersForm);
    this.applyFilters();
  }

  onAmountRangeChange(range: { start: number; end: number }) {
    this.filtersForm.get("amount.min")?.setValue(range.start);
    this.filtersForm.get("amount.max")?.setValue(range.end);
  }

  transformFilters() {
    const filters = this.filtersForm.value;
    return {
      min_amount: filters.amount?.min,
      max_amount: filters.amount?.max,
      title: filters.title || undefined,
      user: filters.user || undefined,
      date_start: filters.dateRange?.start
        ? this.datePipe.transform(filters.dateRange.start, "dd-MM-yyyy")
        : undefined,
      date_end: filters.dateRange?.end
        ? this.datePipe.transform(filters.dateRange.end, "dd-MM-yyyy")
        : undefined,
    };
  }

  filterData(status?: string) {
    const transformedFilters = this.transformFilters();
    if (status) {
      this.loadTransactionsByStatus(status, transformedFilters);
      return;
    }
    this.loadTransactionsByStatus("pending", transformedFilters);
    this.loadTransactionsByStatus("approved", transformedFilters);
    this.loadTransactionsByStatus("rejected", transformedFilters);
    // this.loadTransactions(transformedFilters);
    this.hasActiveFilters = hasActiveFilters(this.filtersForm);
  }

  onChangeTab(index: number) {
    this.currentTab = index;
    sessionStorage.setItem("currentTab", index.toString());
    const status = ["pending", "approved", "rejected"][index];
    // Always reload data to handle real-time changes
    //this.loadTransactionsByStatus(status);
    this.filterData(status);
  }

  onPageChange(status: string, event: PageEvent) {
    console.log("event", event);
    const state = this.transactionStates[status];
    state.pageIndex = event.pageIndex;
    state.pageSize = event.pageSize;
    //this.loadTransactionsByStatus(status);
    this.filterData();
  }

  exportToCSV() {
    let data: any[] = [];
    let title: string = "";

    if (this.currentTab === 0) {
      data = this.transactionStates["pending"].data;
      title = "Pending";
    } else if (this.currentTab === 1) {
      data = this.transactionStates["approved"].data;
      title = "Approved";
    } else if (this.currentTab === 2) {
      data = this.transactionStates["rejected"].data;
      title = "Rejected";
    }

    const csv = Papa.unparse(data);

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${title}_transactions.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  }
}

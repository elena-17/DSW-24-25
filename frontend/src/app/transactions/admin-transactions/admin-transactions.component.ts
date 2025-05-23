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
  MAT_DATE_LOCALE,
  DateAdapter,
  NativeDateAdapter,
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
  providers: [
    DatePipe,
    provideNativeDateAdapter(),
    { provide: MAT_DATE_LOCALE, useValue: "es-ES" },
    { provide: DateAdapter, useClass: NativeDateAdapter },
  ],
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
    seller_processing: { data: [], totalCount: 0, pageIndex: 0, pageSize: 5 },
    seller_approved: { data: [], totalCount: 0, pageIndex: 0, pageSize: 5 },
    seller_rejected: { data: [], totalCount: 0, pageIndex: 0, pageSize: 5 },
  };

  constructor(
    private transactionsService: TransactionsService,
    private datePipe: DatePipe,
    private notificationService: NotificationService,
    private dialog: MatDialog,
  ) {}

  ngOnInit() {
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
    var seller = false;
    if (status.startsWith("seller_")) {
      seller = true;
    }
    const state = this.transactionStates[status];
    const offset = state.pageIndex * state.pageSize;
    const params = {
      ...filters,
      status: seller ? status.replace("seller_", "") : status,
      seller: seller,
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
              this.notificationService.showSuccessMessage(
                "Transaction created",
              );
              if (response.status == "pending") {
                this.transactionStates["pending"].data = [
                  response,
                  ...this.transactionStates["pending"].data,
                ];
                this.transactionStates["pending"].totalCount++;
              } else if (response.status == "processing") {
                this.transactionStates["seller_processing"].data = [
                  response,
                  ...this.transactionStates["seller_processing"].data,
                ];
                this.transactionStates["seller_processing"].totalCount++;
              }
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

    if ((status && status == "seller") || this.currentTab == 3) {
      this.loadTransactionsByStatus("seller_processing", transformedFilters);
      this.loadTransactionsByStatus("seller_approved", transformedFilters);
      this.loadTransactionsByStatus("seller_rejected", transformedFilters);
      return;
    }
    let current = "pending";
    switch (this.currentTab) {
      case 0:
        current = "pending";
        break;
      case 1:
        current = "approved";
        break;
      case 2:
        current = "rejected";
        break;
    }
    this.loadTransactionsByStatus(current, transformedFilters);
    this.hasActiveFilters = hasActiveFilters(this.filtersForm);
  }

  onChangeTab(index: number) {
    this.currentTab = index;
    const status = ["pending", "approved", "rejected", "seller"][index];
    this.filterData(status);
  }

  onPageChange(status: string, event: PageEvent, seller?: boolean) {
    const state = this.transactionStates[seller ? `seller_${status}` : status];
    state.pageIndex = event.pageIndex;
    state.pageSize = event.pageSize;
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
    } else if (this.currentTab === 3) {
      data = [
        ...this.transactionStates["seller_processing"].data,
        ...this.transactionStates["seller_approved"].data,
        ...this.transactionStates["seller_rejected"].data,
      ];
      title = "Seller";
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

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
  applyFilterFn,
} from "../config/filters.config";
import { DetailsTransactionComponent } from "../details-transaction/details-transaction.component";
import { MatDialog } from "@angular/material/dialog";

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
  approvedTransactions: any[] = [];
  pendingTransactions: any[] = [];
  rejectedTransactions: any[] = [];
  filteredApproved: any[] = [];
  filteredPending: any[] = [];
  filteredRejected: any[] = [];

  loading: boolean = false;
  filterOpen: boolean = false;
  filtersForm!: FormGroup;
  columns: any[] = [];
  hasActiveFilters: boolean = false;

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

  loadTransactions(filters: any = {}) {
    this.loading = true; // Start loading
    this.transactionsService.getAdminTransactions(filters).subscribe({
      next: (response) => {
        const data = response.results;
        console.log("Transactions loaded:", response);
        this.approvedTransactions = data.filter(
          (transaction: any) => transaction.status === "approved",
        );
        this.pendingTransactions = data.filter(
          (transaction: any) => transaction.status === "pending",
        );
        this.rejectedTransactions = data.filter(
          (transaction: any) => transaction.status === "rejected",
        );
        this.filteredApproved = [...this.approvedTransactions];
        this.filteredPending = [...this.pendingTransactions];
        this.filteredRejected = [...this.rejectedTransactions];
      },
      error: (error) => {
        console.error("Error loading transactions:", error);
        this.notificationService.showErrorMessage("Error loading transactions");
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
    this.transactionsService
      .updateAdminTransaction(transaction.id, "approved")
      .subscribe({
        next: (response) => {
          console.log("Transaction approved:", response);
          this.notificationService.showSuccessMessage("Transaction approved");
          this.filterData();
        },
        error: (error) => {
          console.error("Error approving transaction:", error);
          this.notificationService.showErrorMessage(
            "Error approving transaction",
          );
        },
      });
  }

  rejectTransaction(transaction: any) {
    this.transactionsService
      .updateAdminTransaction(transaction.id, "rejected")
      .subscribe({
        next: (response) => {
          console.log("Transaction rejected:", response);
          this.notificationService.showSuccessMessage("Transaction rejected");
          this.filterData();
        },
        error: (error) => {
          console.error("Error rejecting transaction:", error);
          this.notificationService.showErrorMessage(
            "Error rejecting transaction",
          );
        },
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

  filterData() {
    const transformedFilters = this.transformFilters();

    this.loadTransactions(transformedFilters);
    this.hasActiveFilters = hasActiveFilters(this.filtersForm);
  }
}

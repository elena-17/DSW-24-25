import { Component, OnInit } from "@angular/core";
import { CommonModule, DatePipe } from "@angular/common";
import { MaterialModule } from "../../material.module";
import { ToolbarComponent } from "../../toolbar/toolbar.component";
import { TableComponent } from "../../shared/table/table.component";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { NotificationService } from "../../services/notification.service";
import { SliderComponent } from "../../shared/slider/slider.component";
import { MatBadgeModule } from "@angular/material/badge";
import { FormGroup, ReactiveFormsModule } from "@angular/forms";
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
} from "../config/filters-admin.config";
import { FormBuilder } from "@angular/forms";

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
  ) {}

  ngOnInit() {
    this.columns = getTransactionColumns(this.datePipe);
    this.initFilters();
    this.loadTransactions();
  }

  // ngAfterViewInit() {
  //   setTimeout(() => {
  //     this.filtersForm.updateValueAndValidity();
  //     this.filterData();
  //   }, 0);
  // }

  initFilters() {
    this.filtersForm = createFilters(new FormBuilder());
  }

  loadTransactions() {
    this.loading = true; // Start loading
    this.transactionsService.getAdminTransactions({}).subscribe({
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

  openDetails(transaction: any) {}

  approveTransaction(transaction: any) {}

  rejectTransaction(transaction: any) {}

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

  filterData() {
    const filters = this.filtersForm.value;
    const apply = (list: any[]) =>
      list.filter((item) => applyFilterFn(filters, item));
    this.filteredApproved = apply(this.approvedTransactions);
    this.filteredPending = apply(this.pendingTransactions);
    this.filteredRejected = apply(this.rejectedTransactions);

    this.hasActiveFilters = hasActiveFilters(filters);
  }
}

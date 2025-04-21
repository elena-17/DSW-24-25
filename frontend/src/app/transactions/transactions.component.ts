import { Component, NgZone, OnInit, OnDestroy } from "@angular/core";
import { ToolbarComponent } from "../toolbar/toolbar.component";
import { MaterialModule } from "../material.module";
import { TransactionsService } from "../services/transactions.service";
import { CommonModule, DatePipe } from "@angular/common";
import { TableComponent } from "../shared/table/table.component";
import { MatDialog } from "@angular/material/dialog";
import { CreateTransactionComponent } from "./create-transaction/create-transaction.component";
import { NotificationService } from "../services/notification.service";
import { ConfirmDialogComponent } from "../shared/confirm-dialog/confirm-dialog.component";
import { DetailsTransactionComponent } from "./details-transaction/details-transaction.component";
import { MatDatepickerModule } from "@angular/material/datepicker";
import {
  FormsModule,
  FormGroup,
  FormBuilder,
  ReactiveFormsModule,
} from "@angular/forms";
import {
  MatNativeDateModule,
  provideNativeDateAdapter,
} from "@angular/material/core";
import { take } from "rxjs";
import { SliderComponent } from "../shared/slider/slider.component";
import { getTransactionColumns } from "./config/transactions-columns.config";
import {
  applyFilterFn,
  createFilters,
  resetFilters,
  hasActiveFilters,
} from "./config/filters.config";

import { MatBadgeModule } from "@angular/material/badge";
import { CounterNotificationService } from "../services/counter-notification.service";
import { TransactionData } from "./config/transaction-state.config";
import { PageEvent } from "@angular/material/paginator";

@Component({
  selector: "app-transactions",
  providers: [DatePipe, provideNativeDateAdapter()],
  imports: [
    ToolbarComponent,
    MaterialModule,
    CommonModule,
    TableComponent,
    MatDatepickerModule,
    FormsModule,
    MatNativeDateModule,
    SliderComponent,
    ReactiveFormsModule,
    MatBadgeModule,
  ],
  templateUrl: "./transactions.component.html",
  styleUrl: "./transactions.component.scss",
})
export class TransactionsComponent implements OnInit {
  transactionsArray: { [key: string]: TransactionData } = {
    sender: { data: [], totalCount: 0, pageIndex: 0, pageSize: 5 },
    receiver: { data: [], totalCount: 0, pageIndex: 0, pageSize: 5 },
    pendingOthers: { data: [], totalCount: 0, pageIndex: 0, pageSize: 5 },
    pendingMyApproval: { data: [], totalCount: 0, pageIndex: 0, pageSize: 5 },
  };

  loading: boolean = false;
  filterOpen: boolean = false;
  filtersForm!: FormGroup;
  columns: any[] = [];
  hasActiveFilters: boolean = false;
  eventSource!: EventSource;
  activeTab: "sender" | "receiver" | "pending" = "pending";

  constructor(
    private dialog: MatDialog,
    private transactionsService: TransactionsService,
    private datePipe: DatePipe,
    private notificationService: NotificationService,
    private ngZone: NgZone,
    private counterNotfService: CounterNotificationService,
  ) {}

  ngOnInit() {
    this.columns = getTransactionColumns(this.datePipe);
    console.log("Columns:", this.columns);
    this.initFilters();
    this.eventSource = new EventSource(
      `http://localhost:3000/.well-known/mercure?topic=user/${sessionStorage.getItem("userEmail")}`,
    );
    this.eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (this.activeTab === "pending") {
        this.ngZone.run(() => {
          // add to pending transactions
          this.transactionsArray["pending"].data = [
            data,
            ...this.transactionsArray["pending"].data,
          ];
          this.transactionsArray["pending"].totalCount += 1;
        });
      }
    };

    this.eventSource.onerror = (error) => {
      console.error("Error en Mercure:", error);
    };
    console.log("EventSource initialized:", this.eventSource);
  }

  ngOnDestroy(): void {
    if (this.eventSource) {
      this.eventSource.close();
    }
  }
  loadTransactions(activeTab: string, others: boolean, filters: any = {}) {
    const isPending = activeTab === "pending";
    const key = isPending
      ? others
        ? "pendingOthers"
        : "pendingMyApproval"
      : activeTab;

    console.log("Loading transactions for:", key);

    const state = this.transactionsArray[key];
    const offset = state.pageIndex * state.pageSize;
    const params: any = {
      ...filters,
      limit: state.pageSize.toString(),
      offset: offset.toString(),
    };

    if (activeTab === "sender") {
      params.type = "send";
    } else if (activeTab === "receiver") {
      params.type = "request";
    }
    if (isPending) {
      params.status = "pending";
      params.pending_type = key;
    }
    this.loading = true;
    this.transactionsService.getTransactions(params).subscribe({
      next: (res: any) => {
        console.log("Response:", res);
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

  ngAfterViewInit() {
    console.log("ngAfterViewInit called");
    setTimeout(() => {
      this.filtersForm.updateValueAndValidity();
      this.filterData();
    }, 0);
  }

  initFilters() {
    this.filtersForm = createFilters(new FormBuilder());
  }

  sendTransaction() {
    const dialogRef = this.dialog.open(CreateTransactionComponent, {
      data: { title: "Send Money" },
      width: "90%",
      height: "60%",
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.transactionsService
          .sendMoney(
            result.user,
            result.amount,
            result.title,
            result.description,
          )
          .subscribe({
            next: (response) => {
              this.transactionsArray["sender"].data = [
                ...response.transactions,
                ...this.transactionsArray["sender"].data,
              ];
              this.transactionsArray["sender"].totalCount += response.count;
              this.transactionsArray["pending"].data = [
                ...response.transactions,
                ...this.transactionsArray["pending"].data,
              ];

              this.notificationService.showSuccessMessage(
                "Transaction sent successfully",
              );
              this.filterData();
            },
            error: (error) => {
              console.error("Error message:", error.error);

              if (
                error.error?.amount?.includes(
                  "Insufficient balance for this transaction.",
                )
              ) {
                this.notificationService.showErrorMessage(
                  "You don't have enough balance to send this amount",
                );
              } else {
                this.notificationService.showErrorMessage(
                  `Sent operation could not be completed`,
                );
              }
            },
          });
      }
    });
  }

  requestTransaction() {
    const dialogRef = this.dialog.open(CreateTransactionComponent, {
      data: { title: "Ask for Money" },
      width: "90%",
      height: "60%",
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.transactionsService
          .requestMoney(
            result.user,
            result.amount,
            result.title,
            result.description,
          )
          .subscribe({
            next: (response) => {
              this.transactionsArray["receiver"].data = [
                ...response.transactions,
                ...this.transactionsArray["receiver"].data,
              ];
              this.transactionsArray["receiver"].totalCount += response.count;
              this.transactionsArray["pending"].data = [
                ...response.transactions,
                ...this.transactionsArray["pending"].data,
              ];
              this.transactionsArray["pending"].totalCount += response.count;
              this.notificationService.showSuccessMessage(
                "Transaction requested successfully",
              );
              this.filterData();
            },
            error: (error) => {
              console.error("Error message:", error.error);
              this.notificationService.showErrorMessage(
                `Request operation could not be completed`,
              );
            },
          });
      }
    });
  }

  filterTransactionChangeStatus(transaction: any, status: string) {
    for (const key in this.transactionsArray) {
      const index = this.transactionsArray[key].data.findIndex(
        (item: any) => item.id === transaction.id,
      );
      if (index !== -1) {
        if (status === "approved" || status === "rejected") {
          this.transactionsArray[key].data.splice(index, 1);
          this.transactionsArray[key].totalCount -= 1;
        } else {
          this.transactionsArray[key].data[index].status = status;
        }
      }
    }
  }

  approveTransaction(transaction: any) {
    this.transactionsService
      .updateTransaction(transaction.id, "approved")
      .subscribe({
        next: (response) => {
          this.notificationService.showSuccessMessage("Transaction approved");
          this.filterTransactionChangeStatus(transaction, "approved");
          this.filterData();
          this.counterNotfService.decrement();
        },
        error: (error) => {
          console.error("Error approving transaction:", error);
          this.notificationService.showErrorMessage(
            `Transaction could not be approved`,
          );
        },
      });
  }

  rejectTransaction(transaction: any) {
    this.transactionsService
      .updateTransaction(transaction.id, "rejected")
      .subscribe({
        next: (response) => {
          this.filterTransactionChangeStatus(transaction, "rejected");
          this.notificationService.showSuccessMessage("Transaction rejected");
          this.blockUser(transaction);
          this.counterNotfService.decrement();
        },
        error: (error) => {
          console.error("Error rejecting transaction:", error);
          this.notificationService.showErrorMessage(
            `Transaction could not be rejected`,
          );
        },
      });
  }

  openDetails(transaction: any) {
    console.log(transaction);
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

  blockUser(transaction: any) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: "Block User",
        message:
          "You have rejected a transaction. Do you also want to block this user?",
      },
      width: "30%",
      height: "30%",
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.notificationService.showSuccessMessage("To be done...");
      }
    });
  }

  //
  // filters
  //
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
      status:
        Object.keys(filters.status || {})
          .filter((key) => filters.status[key])
          .join(",") || undefined,
    };
  }

  onTabChange(index: number) {
    const status = ["pending", "sender", "receiver"][index];
    this.activeTab = status as "sender" | "receiver" | "pending";
    const filters = this.transformFilters();
    if (this.activeTab === "pending") {
      this.loadTransactions(this.activeTab, false);
      this.loadTransactions(this.activeTab, true);
    } else {
      this.loadTransactions(this.activeTab, false);
    }
  }

  onPageChange(table: string, event: PageEvent) {
    const state = this.transactionsArray[table];
    state.pageIndex = event.pageIndex;
    state.pageSize = event.pageSize;
    this.filterData();
  }

  filterData() {
    const filters = this.transformFilters();
    if (this.activeTab === "pending") {
      this.loadTransactions(this.activeTab, false, filters);
      this.loadTransactions(this.activeTab, true, filters);
    } else {
      this.loadTransactions(this.activeTab, false, filters);
    }
    this.hasActiveFilters = hasActiveFilters(this.filtersForm);
  }
}

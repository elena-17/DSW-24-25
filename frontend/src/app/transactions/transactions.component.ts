import { Component, OnInit, ViewChild } from "@angular/core";
import { ToolbarComponent } from "../toolbar/toolbar.component";
import { Router } from "@angular/router";
import { AuthService } from "../services/auth.service";
import { MaterialModule } from "../material.module";
import { TransactionsService } from "../services/transactions.service";
import { CommonModule } from "@angular/common";
import { TableComponent } from "../shared/table/table.component";
import { MatDialog } from "@angular/material/dialog";
import { CreateTransactionComponent } from "./create-transaction/create-transaction.component";
import { DatePipe } from "@angular/common";
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
import { provideNativeDateAdapter } from "@angular/material/core";
import { MatNativeDateModule } from "@angular/material/core";
import { take } from "rxjs";
import { SliderComponent } from "../shared/slider/slider.component";
import { getTransactionColumns } from "./config/transactions-columns.config";
import {
  applyFilterFn,
  createFilters,
  resetFilters,
} from "./config/filters.config";

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
  ],
  templateUrl: "./transactions.component.html",
  styleUrl: "./transactions.component.scss",
})
export class TransactionsComponent implements OnInit {
  sender: any[] = [];
  receiver: any[] = [];
  pendingOthers: any[] = [];
  pendingMyApproval: any[] = [];
  filteredSender: any[] = [];
  filteredReceiver: any[] = [];
  filteredPendingOthers: any[] = [];
  filteredPendingMyApproval: any[] = [];

  loading: boolean = false;
  filterOpen: boolean = false;
  filtersForm!: FormGroup;
  columns: any[] = [];

  constructor(
    private dialog: MatDialog,
    private router: Router,
    private authService: AuthService,
    private transactionsService: TransactionsService,
    private datePipe: DatePipe,
    private notificationService: NotificationService,
  ) {}

  ngOnInit() {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(["error-page"]);
      return;
    }
    this.columns = getTransactionColumns(this.datePipe);
    this.initFilters();
    this.loadTransactions();
  }

  loadTransactions() {
    this.transactionsService
      .getLoading()
      .pipe(take(1))
      .subscribe((isLoading) => {
        this.loading = isLoading;
      });

    this.transactionsService
      .fetch(true)
      .pipe(take(1))
      .subscribe(({ receiver, sender }) => {
        this.receiver = [...receiver];
        this.sender = [...sender];
        this.loading = false;
        if (!this.sender || !this.receiver) {
          this.pendingMyApproval = [];
          this.pendingOthers = [];
          return;
        }
        this.pendingOthers = [
          ...this.sender.filter(
            (transaction) =>
              transaction.status.toLowerCase() === "pending" &&
              transaction.type === "send",
          ),
          ...this.receiver.filter(
            (transaction) =>
              transaction.status.toLowerCase() === "pending" &&
              transaction.type === "request",
          ),
        ];
        this.pendingMyApproval = [
          ...this.sender.filter(
            (transaction) =>
              transaction.status.toLowerCase() === "pending" &&
              transaction.type === "request",
          ),
          ...this.receiver.filter(
            (transaction) =>
              transaction.status.toLowerCase() === "pending" &&
              transaction.type === "send",
          ),
        ];
      });
    setTimeout(() => {
      this.filtersForm.updateValueAndValidity();
      this.filterData();
    }, 0);
  }

  ngAfterViewInit() {
    // Este hook se ejecuta después de que la vista se haya inicializado
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
          .sendMoney(result.user, result.amount, result.title)
          .subscribe({
            next: (response) => {
              this.sender = [...response.transactions, ...this.sender];
              this.pendingOthers = [
                ...response.transactions,
                ...this.pendingOthers,
              ];
              this.notificationService.showSuccessMessage(
                "Transaction sent successfully",
              );
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
          .requestMoney(result.user, result.amount, result.title)
          .subscribe({
            next: (response) => {
              this.receiver = [...response.transactions, ...this.receiver];
              this.pendingOthers = [
                ...response.transactions,
                ...this.pendingOthers,
              ];
              this.notificationService.showSuccessMessage(
                "Transaction requested successfully",
              );
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
    const senderTransaction = this.sender.find((t) => t.id === transaction.id);
    if (senderTransaction) {
      senderTransaction.status = status;
    }

    const receiverTransaction = this.receiver.find(
      (t) => t.id === transaction.id,
    );
    if (receiverTransaction) {
      receiverTransaction.status = status;
    }
    this.pendingOthers = this.pendingOthers.filter(
      (t) => t.id !== transaction.id,
    );

    this.pendingMyApproval = this.pendingMyApproval.filter(
      (t) => t.id !== transaction.id,
    );
  }

  approveTransaction(transaction: any) {
    this.transactionsService
      .updateTransaction(transaction.id, "approved")
      .subscribe({
        next: (response) => {
          this.notificationService.showSuccessMessage("Transaction approved");
          this.filterTransactionChangeStatus(transaction, "approved");
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
      width: "25%",
      height: "25%",
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

  filterData() {
    const filters = this.filtersForm.value;
    const apply = (list: any[]) =>
      list.filter((item) => applyFilterFn(filters, item));

    this.filteredSender = apply(this.sender);
    this.filteredReceiver = apply(this.receiver);
    this.filteredPendingMyApproval = apply(this.pendingMyApproval);
    this.filteredPendingOthers = apply(this.pendingOthers);
  }
}

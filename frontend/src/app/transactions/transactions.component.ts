import { Component, OnInit, ViewChild } from "@angular/core";
import { ToolbarComponent } from "../toolbar/toolbar.component";
import { Router } from "@angular/router";
import { AuthService } from "../services/auth.service";
import { MaterialModule } from "../material.module";
import { MatTabsModule } from "@angular/material/tabs";
import { TransactionsService } from "../services/transactions.service";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { CommonModule } from "@angular/common";
import { TableComponent } from "../shared/table/table.component";
import { MatDialog } from "@angular/material/dialog";
import { CreateTransactionComponent } from "./create-transaction/create-transaction.component";
import { DatePipe } from "@angular/common";
import { NotificationService } from "../services/notification.service";
import { ConfirmDialogComponent } from "../shared/confirm-dialog/confirm-dialog.component";
import { DetailsTransactionComponent } from "./details-transaction/details-transaction.component";
import { MatSidenav, MatSidenavModule } from "@angular/material/sidenav";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { MatSelectModule } from "@angular/material/select";
import {
  FormsModule,
  FormGroup,
  FormBuilder,
  ReactiveFormsModule,
} from "@angular/forms";
import { provideNativeDateAdapter } from "@angular/material/core";
import { MatNativeDateModule } from "@angular/material/core";
import { MatSliderModule } from "@angular/material/slider";
import { take } from "rxjs";
import { SliderComponent } from "../shared/slider/slider.component";

@Component({
  selector: "app-transactions",
  providers: [DatePipe, provideNativeDateAdapter()],
  imports: [
    ToolbarComponent,
    MaterialModule,
    MatTabsModule,
    MatProgressSpinnerModule,
    CommonModule,
    TableComponent,
    MatSidenavModule,
    MatDatepickerModule,
    MatSelectModule,
    FormsModule,
    MatNativeDateModule,
    MatSliderModule,
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

  columns = [
    {
      columnDef: "title",
      header: "Title",
      cell: (element: any) => element.title,
      component: "text-icon",
      getComponentProps: (element: any) => ({
        text: element.title,
        icon:
          element.sender === sessionStorage.getItem("userEmail")
            ? "call_made"
            : "call_received",
        color:
          element.sender === sessionStorage.getItem("userEmail")
            ? "green"
            : "red",
      }),
    },
    {
      columnDef: "user",
      header: "User",
      cell: (element: any) =>
        element.sender === sessionStorage.getItem("userEmail")
          ? element.receiver
          : element.sender,
    },
    {
      columnDef: "amount",
      header: "Amount",
      cell: (element: any) => `${element.amount}`,
    },
    {
      columnDef: "date",
      header: "Date",
      cell: (element: any) =>
        this.datePipe.transform(new Date(element.created_at), "dd/MM/yyyy") ||
        "",
    },
    {
      columnDef: "status",
      header: "Status",
      cell: (element: any) => element.status,
      component: "badge",
      getComponentProps: (element: any) => ({
        text: element.status,
        icon: this.getStatusIcon(element.status),
        class: element.status.toLowerCase(),
      }),
    },
  ];

  @ViewChild("sidenav") sidenav!: MatSidenav;

  constructor(
    private dialog: MatDialog,
    private router: Router,
    private authService: AuthService,
    private transactionsService: TransactionsService,
    private datePipe: DatePipe,
    private notificationService: NotificationService,
    private formBuilder: FormBuilder,
  ) {}

  ngOnInit() {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(["error-page"]);
      return;
    }
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
  }

  initFilters() {
    this.filtersForm = this.formBuilder.group({
      title: [""],
      user: [""],
      dateRange: this.formBuilder.group({
        start: [null],
        end: [null],
      }),
      status: this.formBuilder.group({
        pending: [true],
        approved: [true],
        rejected: [true],
      }),
      amount: this.formBuilder.group({
        min: [0],
        max: [100000],
      }),
    });

    // this.filtersForm.valueChanges.subscribe(() => this.applyFilters());
  }

  getStatusIcon(status: string): string {
    switch (status.toLowerCase()) {
      case "approved":
        return "task_alt";
      case "pending":
        return "hourglass_empty";
      case "rejected":
        return "block";
      default:
        return "help_outline";
    }
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
    this.filtersForm.reset({
      title: "",
      user: "",
      dateRange: {
        start: null,
        end: null,
      },

      status: {
        pending: true,
        approved: true,
        rejected: true,
      },
      amount: {
        min: 0,
        max: 100000,
      },
    });
    this.applyFilters();
  }

  onAmountRangeChange(range: { start: number; end: number }) {
    this.filtersForm.get("amount.min")?.setValue(range.start);
    this.filtersForm.get("amount.max")?.setValue(range.end);
  }

  filterData() {
    const filters = this.filtersForm.value;
    const selectedStatuses = Object.entries(filters.status)
      .filter(([_, value]) => value)
      .map(([key]) => key.toLowerCase());

    const filterFn = (item: any) => {
      const matchesStatus =
        selectedStatuses.length === 0 ||
        selectedStatuses.includes(item.status.toLowerCase());

      const matchesUser =
        !filters.user ||
        item.sender.toLowerCase().includes(filters.user.toLowerCase()) ||
        item.receiver.toLowerCase().includes(filters.user.toLowerCase());

      const matchesAmount =
        item.amount >= filters.amount.min && item.amount <= filters.amount.max;

      const matchesDateRange =
        (!filters.dateRange.start ||
          new Date(item.created_at) >= new Date(filters.dateRange.start)) &&
        (!filters.dateRange.end ||
          new Date(item.created_at) <= new Date(filters.dateRange.end));

      const matchesTitle =
        !filters.title ||
        item.title.toLowerCase().includes(filters.title.toLowerCase());

      return (
        matchesStatus &&
        matchesUser &&
        matchesAmount &&
        matchesDateRange &&
        matchesTitle
      );
    };

    this.filteredSender = this.sender.filter(filterFn);
    this.filteredReceiver = this.receiver.filter(filterFn);
    this.filteredPendingMyApproval = this.pendingMyApproval.filter(filterFn);
    this.filteredPendingOthers = this.pendingOthers.filter(filterFn);
  }
}

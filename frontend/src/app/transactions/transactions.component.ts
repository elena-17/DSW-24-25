import { Component, OnInit } from "@angular/core";
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
import { MatSnackBar } from "@angular/material/snack-bar";
import { DatePipe } from "@angular/common";
import { NotificationService } from "../services/notification.service";
import { ConfirmDialogComponent } from "../shared/confirm-dialog/confirm-dialog.component";

//test data
const SENDER_DATA = [
  {
    id: 1,
    receiver: "user1",
    created_at: "2023-01-01",
    amount: 100,
    title: "Transaction 1",
    status: "Approved",
  },
  {
    id: 2,
    receiver: "user2",
    created_at: "2023-01-02",
    amount: 200,
    title: "Transaction 2",
    status: "Pending",
  },
  {
    id: 2,
    receiver: "user2",
    created_at: "2023-01-02",
    amount: 200,
    title: "Transaction 2",
    status: "Rejected",
  },
];
const RECEIVER_DATA = [
  {
    id: 1,
    sender: "user3",
    created_at: "2023-01-03",
    amount: 150,
    title: "Transaction 3",
    status: "Approved",
  },
  {
    id: 2,
    sender: "user4",
    created_at: "2023-01-04",
    amount: 250,
    title: "Transaction 4",
    status: "Pending",
  },
  {
    id: 3,
    sender: "user4",
    created_at: "2023-01-04",
    amount: 250,
    title: "Transaction 4",
    status: "Rejected",
  },
];

@Component({
  selector: "app-transactions",
  providers: [DatePipe],
  imports: [
    ToolbarComponent,
    MaterialModule,
    MatTabsModule,
    MatProgressSpinnerModule,
    CommonModule,
    TableComponent,
  ],
  templateUrl: "./transactions.component.html",
  styleUrl: "./transactions.component.scss",
})
export class TransactionsComponent implements OnInit {
  sender: any[] = [];
  receiver: any[] = [];
  pendingOthers: any[] = [];
  pendingMyApproval: any[] = [];
  loading: boolean = false;

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

  constructor(
    private dialog: MatDialog,
    private router: Router,
    private authService: AuthService,
    private transactionsService: TransactionsService,
    private snackBar: MatSnackBar,
    private datePipe: DatePipe,
    private notificationService: NotificationService,
  ) {}

  ngOnInit() {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(["error-page"]);
      return;
    }
    // this.sender = []; // Replace with actual data fetching logic
    // this.receiver = RECEIVER_DATA; // Replace with actual data fetching logic
    this.loadTransactions();
  }

  loadTransactions() {
    this.transactionsService.getLoading().subscribe((isLoading) => {
      this.loading = isLoading;
    });

    this.transactionsService.fetch(true).subscribe(({ receiver, sender }) => {
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
              this.notificationService.showErrorMessage(
                `Sent operation could not be completed`,
              );
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
}

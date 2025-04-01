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

//test data
const SENDER_DATA = [
  {
    id: 1,
    receiver: "user1",
    date: "2023-01-01",
    amount: 100,
    title: "Transaction 1",
    status: "Approved",
  },
  {
    id: 2,
    receiver: "user2",
    date: "2023-01-02",
    amount: 200,
    title: "Transaction 2",
    status: "Pending",
  },
  {
    id: 2,
    receiver: "user2",
    date: "2023-01-02",
    amount: 200,
    title: "Transaction 2",
    status: "Rejected",
  },
];
const RECEIVER_DATA = [
  {
    id: 1,
    sender: "user3",
    date: "2023-01-03",
    amount: 150,
    title: "Transaction 3",
    status: "Approved",
  },
  {
    id: 2,
    sender: "user4",
    date: "2023-01-04",
    amount: 250,
    title: "Transaction 4",
    status: "Pending",
  },
  {
    id: 3,
    sender: "user4",
    date: "2023-01-04",
    amount: 250,
    title: "Transaction 4",
    status: "Rejected",
  },
];

@Component({
  selector: "app-transactions",
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
  loading: boolean = false;
  loadingReceiver: boolean = false;

  columns = [
    {
      columnDef: "title",
      header: "Title",
      cell: (element: any) => element.title,
      component: "text-icon",
      getComponentProps: (element: any) => ({
        text: element.title,
        icon: element.sender ? "call_received" : "call_made",
      }),
    },
    {
      columnDef: "user",
      header: "User",
      cell: (element: any) => `${element.sender || element.receiver}`,
    },
    {
      columnDef: "amount",
      header: "Amount",
      cell: (element: any) => `${element.amount}`,
    },
    {
      columnDef: "date",
      header: "Date",
      cell: (element: any) => `${element.date}`,
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
  ) {}

  ngOnInit() {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(["error-page"]);
      return;
    }
    // this.sender = []; // Replace with actual data fetching logic
    // this.receiver = RECEIVER_DATA; // Replace with actual data fetching logic
    this.transactionsService.getLoading().subscribe(isLoading => {
      this.loading = isLoading;
    });

    this.transactionsService.fetch().subscribe(({ receiver, sender }) => {
      console.log("Sender:", sender);
      this.receiver = [...receiver];
      this.sender = [...sender];
      this.loading = false;
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
    console.log("Send transaction clicked");
    const defaultTransaction = {
      id: this.sender.length + 1,
      receiver: "user1",
      date: "2023-01-01",
      amount: 100,
      title: "Transaction 1",
      status: "Approved",
    };
    console.log(this.sender);
    this.sender = [defaultTransaction, ...this.sender];
    console.log(this.sender);
  }

  requestTransaction() {
     const dialogRef = this.dialog.open(CreateTransactionComponent, {
          data: { title: "Ask for Money" },
          width: "75%",
          height: "55%",
        });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        console.log("Transaction requested:", result);
          this.transactionsService.requestMoney(result.user, result.amount, result.title).subscribe({
            next: (response) => {
             console.log("Transaction requested successfully:", response);
             this.receiver = [response, ...this.receiver];
            },
            error: (error) => {
              console.error("Registration failed:", error);
              console.error("Error message:", error.error);
              this.snackBar.open(
                "Registration failed. Please try again.",
                "OK",
                {
                  duration: 5000,
                  horizontalPosition: "center",
                  verticalPosition: "top",
                },
              );
            },
          });
        
      }
    });
  }
}

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

//test data
const SENDER_DATA = [
  {
    id: 1,
    user: "user1",
    date: "2023-01-01",
    amount: 100,
    title: "Transaction 1",
    status: "Completed",
  },
  {
    id: 2,
    user: "user2",
    date: "2023-01-02",
    amount: 200,
    title: "Transaction 2",
    status: "Pending",
  },
];
const RECEIVER_DATA = [
  {
    id: 1,
    user: "user3",
    date: "2023-01-03",
    amount: 150,
    title: "Transaction 3",
    status: "Completed",
  },
  {
    id: 2,
    user: "user4",
    date: "2023-01-04",
    amount: 250,
    title: "Transaction 4",
    status: "Pending",
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
      cell: (element: any) => `${element.title}`,
    },
    {
      columnDef: "user",
      header: "User",
      cell: (element: any) => `${element.user}`,
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
      cell: (element: any) => `${element.status}`,
    },
  ];

  constructor(
    private router: Router,
    private authService: AuthService,
    private transactionsService: TransactionsService,
  ) {}

  ngOnInit() {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(["error-page"]);
      return;
    }
    this.sender = SENDER_DATA; // Replace with actual data fetching logic
    this.receiver = RECEIVER_DATA; // Replace with actual data fetching logic
    // this.transactionsService.getLoading().subscribe(isLoading => {
    //   this.loading = isLoading;
    // });

    // this.transactionsService.fetch().subscribe(({ receiver, sender }) => {
    //   this.receiver = receiver;
    //   this.sender = sender;
    //   this.loading = false;
    // });
  }
}

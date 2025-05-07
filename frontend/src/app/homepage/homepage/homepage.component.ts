import { Component, OnInit } from "@angular/core";
import { ToolbarComponent } from "../../toolbar/toolbar.component";
import { UserService } from "../../services/user.service";
import { CommonModule } from "@angular/common";
import { MatIconModule } from "@angular/material/icon";
import { MatButtonModule } from "@angular/material/button";
import { MatCardModule } from "@angular/material/card";
import { MatDialog } from "@angular/material/dialog";
import { ChangeAccountBalanceComponent } from "./change-account-balance/change-account-balance.component";
import { DashboardService } from "../../services/dashboard.service";
import { NotificationService } from "../../services/notification.service";
import { NgApexchartsModule } from "ng-apexcharts";
@Component({
  selector: "app-homepage",
  standalone: true,
  imports: [
    ToolbarComponent,
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    NgApexchartsModule,
  ],
  templateUrl: "./homepage.component.html",
  styleUrl: "./homepage.component.scss",
})
export class HomepageComponent implements OnInit {
  balance: number = 0; //Default balance
  dashboardData: any = null;
  isLoading = true;
  chart_balance: any = {
    series: [],
    chart: { type: "line" },
    xaxis: { categories: [] },
    title: { text: "Last 30 days balance", align: "center", margin: 10 },
    stroke: { curve: "smooth", width: 2 },
    dataLabels: { enabled: false },
    tooltip: { enabled: true },
  };
  chart_monthly: any = {
    series: [],
    chart: { type: "bar" },
    xaxis: { categories: [] },
    title: { text: "Monthly balance", align: "center", margin: 10 },
    stroke: { curve: "smooth", width: 2 },
    dataLabels: { enabled: false },
    tooltip: { enabled: true },
    plotOptions: {},
  };
  name = sessionStorage.getItem("userName");

  constructor(
    private userService: UserService,
    private dialog: MatDialog,
    private dashboardService: DashboardService,
    private notificationService: NotificationService,
  ) {}

  ngOnInit() {
    this.loadBalance();
    this.fetchUserDashboardData();
  }

  loadBalance(): void {
    this.userService.getAccountBalance().subscribe({
      next: (response) => {
        this.balance = response.balance;
      },
      error: () => {
        this.notificationService.showErrorMessage(
          "Failed to load account balance. Please try again later.",
        );
      },
    });
  }

  depositFunds(): void {
    const dialogRef = this.dialog.open(ChangeAccountBalanceComponent, {
      data: { title: "Deposit", action: "deposit" },
      width: "90%",
      height: "60%",
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.balance = result.balance;
      }
    });
  }

  withdrawFunds(): void {
    const dialogRef = this.dialog.open(ChangeAccountBalanceComponent, {
      data: { title: "Withdraw", action: "withdraw" },
      width: "90%",
      height: "60%",
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.balance = result.balance;
      }
    });
  }

  fetchUserDashboardData(): void {
    this.dashboardService.getUserDashboard().subscribe({
      next: (data) => {
        this.dashboardData = data;
        this.dashboardData.last_login = this.dashboardData.last_login
          ? new Date(this.dashboardData.last_login).toLocaleString()
          : "Never";
        this.isLoading = false;
        this.loadChartData();
      },
      error: (error) => {
        console.error("Error fetching user dashboard data:", error);
        this.notificationService.showErrorMessage(
          "Failed to load user dashboard data. Please try again later.",
        );
      },
    });
  }

  loadChartData(): void {
    const data = this.dashboardData.balance_chart;

    this.chart_balance.series = [
      {
        name: "Money Sent",
        data: data.map((t: any) => t.money_sender),
        color: "red",
      },
      {
        name: "Money Received",
        data: data.map((t: any) => t.money_receiver),
        color: "green",
      },
    ];
    this.chart_balance.xaxis.categories = data.map((t: any) => t.day);
    this.chart_balance.chart = {
      type: "line",
      height: 350,
      toolbar: { show: true, tools: { download: true } },
      zoom: {
        enabled: false,
      },
    };
    const monthly = this.dashboardData.monthly_chart;
    this.chart_monthly.series = [
      {
        name: "Total Amount",
        data: monthly.map((t: any) => t.balance),
      },
    ];
    this.chart_monthly.xaxis.categories = monthly.map((t: any) => t.month);
    this.chart_monthly.chart = {
      type: "line",
      height: 350,
      toolbar: { show: true, tools: { download: true } },
      zoom: {
        enabled: false,
      },
    };
  }
}

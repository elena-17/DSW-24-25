import { Component, OnInit } from "@angular/core";
import { MaterialModule } from "../../material.module";
import { ToolbarComponent } from "../../toolbar/toolbar.component";
import { MatListModule } from "@angular/material/list";
import { MatGridListModule } from "@angular/material/grid-list";
import { DashboardService } from "../../services/dashboard.service";
import {
  ApexAxisChartSeries,
  ApexChart,
  ApexXAxis,
  ApexTitleSubtitle,
  ApexStroke,
  ApexDataLabels,
  ApexTooltip,
  NgApexchartsModule,
} from "ng-apexcharts";

export type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  title: ApexTitleSubtitle;
  stroke: ApexStroke;
  dataLabels: ApexDataLabels;
  tooltip: ApexTooltip;
};

@Component({
  selector: "app-admin-homepage",
  imports: [
    MaterialModule,
    ToolbarComponent,
    MatListModule,
    MatGridListModule,
    NgApexchartsModule,
  ],
  templateUrl: "./admin-homepage.component.html",
  styleUrl: "./admin-homepage.component.scss",
})
export class AdminHomepageComponent implements OnInit {
  dashboardData: any = null;
  isLoading = true;
  error: string | null = null;
  chartOptions: Partial<ChartOptions> = {};
  chartSeries: ApexAxisChartSeries = [];

  constructor(private dashboardService: DashboardService) {}

  ngOnInit() {
    this.fetchAdminDashboardData();
  }

  fetchAdminDashboardData() {
    this.dashboardService.getAdminDashboard().subscribe({
      next: (data) => {
        this.dashboardData = data;
        this.isLoading = false;
        this.loadChartData();
        console.log("Admin dashboard data:", this.dashboardData);
      },
      error: (err) => {
        console.error("Error fetching admin dashboard data:", err);
        this.error = "Failed to load dashboard data. Please try again later.";
        this.isLoading = false;
      },
    });
  }

  loadChartData() {
    //   this.chartSeries = [
    //     {
    //       name: 'Transactions',
    //       data: this.dashboardData.transactions_per_day.map(t => t.count)
    //     }
    //   ];
    //   this.chartOptions = {
    //     chart: {
    //       type: 'line',
    //       height: 300,
    //       toolbar: { show: false }
    //     },
    //     title: {
    //       text: 'Daily Transactions',
    //       align: 'left'
    //     },
    //     xaxis: {
    //       categories: this.dashboardData.transactions_per_day.map(t =>
    //         new Date(t.day).toLocaleDateString('en-GB', {
    //           day: '2-digit',
    //           month: 'short'
    //         })
    //       ),
    //       labels: {
    //         rotate: -45
    //       }
    //     },
    //     stroke: {
    //       curve: 'smooth',
    //       width: 2
    //     },
    //     dataLabels: {
    //       enabled: false
    //     },
    //     tooltip: {
    //       x: {
    //         format: 'dd MMM'
    //       }
    //     }
    //   };
  }
}

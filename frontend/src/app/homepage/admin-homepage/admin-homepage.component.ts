import { Component, OnInit } from "@angular/core";
import { MaterialModule } from "../../material.module";
import { ToolbarComponent } from "../../toolbar/toolbar.component";
import { MatListModule } from "@angular/material/list";
import { MatGridListModule } from "@angular/material/grid-list";
import { DashboardService } from "../../services/dashboard.service";
import { CommonModule } from "@angular/common";
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
import { ChangeDetectorRef } from "@angular/core";

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
    CommonModule,
  ],
  templateUrl: "./admin-homepage.component.html",
  styleUrl: "./admin-homepage.component.scss",
})
export class AdminHomepageComponent implements OnInit {
  dashboardData: any = null;
  isLoading = true;
  error: string | null = null;
  chartOptions_count: ChartOptions = {
    series: [],
    chart: { type: "line" },
    xaxis: { categories: [] },
    title: { text: "Last 30 days transactions" },
    stroke: { curve: "smooth" },
    dataLabels: { enabled: false },
    tooltip: { enabled: true },
  };
  chartOptions_money: ChartOptions = {
    series: [],
    chart: { type: "line" },
    xaxis: { categories: [] },
    title: { text: "Last 30 days total amount" },
    stroke: { curve: "smooth" },
    dataLabels: { enabled: false },
    tooltip: { enabled: true },
  };
  constructor(
    private dashboardService: DashboardService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    this.fetchAdminDashboardData();
  }

  fetchAdminDashboardData() {
    this.dashboardService.getAdminDashboard().subscribe({
      next: (data) => {
        this.dashboardData = data;
        this.isLoading = false;
        this.loadChartData();
      },
      error: (err) => {
        console.error("Error fetching admin dashboard data:", err);
        this.error = "Failed to load dashboard data. Please try again later.";
        this.isLoading = false;
      },
    });
  }

  loadChartData() {
    const data = this.dashboardData.transactions_chart;

    this.chartOptions_count = {
      series: [
        {
          name: "Transactions",
          data: data.map((t: any) => t.count),
        },
      ],
      chart: {
        type: "bar",
        height: 300,
        toolbar: { show: true, tools: { download: true } },
        zoom: {
          enabled: false,
        },
      },
      title: {
        text: "Last 30 days transactions",
        align: "center",
        margin: 10,
        style: {
          fontSize: "16px",
        },
      },
      xaxis: {
        categories: data.map((t: any) => t.day),
        labels: {
          show: true,
          rotateAlways: true,
          rotate: -45,
          style: {
            fontSize: "12px",
          },
        },
        tickPlacement: "on",
      },
      stroke: {
        show: true,
        width: 2,
      },
      dataLabels: {
        enabled: false,
      },
      tooltip: {
        enabled: true,
        x: {
          format: "dd MMM",
        },
      },
    };
    this.chartOptions_money = {
      series: [
        {
          name: "Total Amount",
          data: data.map((t: any) => t.total_amount),
        },
      ],
      chart: {
        type: "line",
        height: 300,
        toolbar: { show: true, tools: { download: true } },
        zoom: {
          enabled: false,
        },
      },
      title: {
        text: "Last 30 days total amount",
        align: "center",
        margin: 10,
        style: { fontSize: "16px" },
      },
      xaxis: {
        categories: data.map((t: any) => t.day),
        labels: {
          show: true,
          rotateAlways: true,
          rotate: -45, // rotación etiquetas
          style: {
            fontSize: "12px",
          },
        },
        tickPlacement: "on",
      },
      stroke: {
        show: true,
        width: 2,
      },
      dataLabels: {
        enabled: false,
      },
      tooltip: {
        enabled: true,
        x: {
          format: "dd MMM",
        },
      },
    };
    this.chartOptions_count = { ...this.chartOptions_count };
    this.chartOptions_money = { ...this.chartOptions_money };
    this.cdr.markForCheck();
  }
}

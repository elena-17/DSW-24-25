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
  ApexPlotOptions,
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
    CommonModule,
  ],
  templateUrl: "./admin-homepage.component.html",
  styleUrl: "./admin-homepage.component.scss",
})
export class AdminHomepageComponent implements OnInit {
  dashboardData: any = null;
  isLoading = true;
  error: string | null = null;
  chartOptions: ChartOptions = {
    series: [],
    chart: { type: 'line' },
    xaxis: { categories: [] },
    title: { text: '' },
    stroke: { curve: 'smooth' },
    dataLabels: { enabled: false },
    tooltip: { enabled: true },
  };
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
    const data = this.dashboardData.transactions_per_day;
  
    this.chartOptions = {
      series: [
        {
          name: 'Transactions',
          data: data.map((t: any) => t.count),
        },
      ],
      chart: {
        type: 'bar', // Cambiar de 'line' a 'bar'
        height: 300,
        toolbar: { show: false },
      },
      title: {
        text: 'Last 30 days transactions',
        align: 'center',
        margin: 10,
        style: {
          fontSize:  '16px',
        },
      },
      xaxis: {
        categories: data.map((t: any) => t.day),
        labels: {
          show: true,
          rotateAlways: true,
          rotate: -45,     // rotación etiquetas
          style: {
            fontSize: '12px',
          }
        },
        tickPlacement: 'on'
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
          format: 'dd MMM',
        },
      },
    };
    setTimeout(() => {
      this.chartOptions = { ...this.chartOptions };
    }, 0);
  }
}

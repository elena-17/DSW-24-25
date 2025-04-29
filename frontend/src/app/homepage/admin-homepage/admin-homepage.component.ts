import { Component, OnInit } from "@angular/core";
import { MaterialModule } from "../../material.module";
import { ToolbarComponent } from "../../toolbar/toolbar.component";
import { MatListModule } from "@angular/material/list";
import { MatGridListModule } from "@angular/material/grid-list";
import { DashboardService } from "../../services/dashboard.service";

@Component({
  selector: "app-admin-homepage",
  imports: [MaterialModule, ToolbarComponent, MatListModule, MatGridListModule],
  templateUrl: "./admin-homepage.component.html",
  styleUrl: "./admin-homepage.component.scss",
})
export class AdminHomepageComponent implements OnInit {
  dashboardData: any = null;
  isLoading = true;
  error: string | null = null;

  constructor(private dashboardService: DashboardService) {}

  ngOnInit() {
    this.fetchAdminDashboardData();
  }

  fetchAdminDashboardData() {
    this.dashboardService.getAdminDashboard().subscribe({
      next: (data) => {
        this.dashboardData = data;
        this.isLoading = false;
        console.log("Admin dashboard data:", this.dashboardData);
      },
      error: (err) => {
        console.error("Error fetching admin dashboard data:", err);
        this.error = "Failed to load dashboard data. Please try again later.";
        this.isLoading = false;
      },
    });
  }
  timeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return "just now";
    if (minutes === 1) return "1 minute ago";
    if (minutes < 60) return `${minutes} minutes ago`;
    const hours = Math.floor(minutes / 60);
    if (hours === 1) return "1 hour ago";
    return `${hours} hours ago`;
  }
}

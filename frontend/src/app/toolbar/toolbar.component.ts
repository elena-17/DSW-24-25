import { Component, OnInit, OnDestroy } from "@angular/core";
import { MatToolbarModule } from "@angular/material/toolbar";
import { CommonModule } from "@angular/common";
import { Router } from "@angular/router";
import { MaterialModule } from "../material.module";
import { MatBadgeModule } from "@angular/material/badge";
import { TransactionsService } from "../services/transactions.service";
import { CounterNotificationService } from "../services/counter-notification.service";

@Component({
  selector: "app-toolbar",
  standalone: true,
  imports: [CommonModule, MatToolbarModule, MaterialModule, MatBadgeModule],
  templateUrl: "./toolbar.component.html",
  styleUrls: ["./toolbar.component.scss"],
})
export class ToolbarComponent implements OnInit, OnDestroy {
  isMenuOpen: boolean = false; //Status menu
  isUserMenuOpen: boolean = false; // Status user menu
  userName: string = "User"; // value for default username
  role: string = "user";
  notifications: number = 0;

  constructor(
    private router: Router,
    private transactionsService: TransactionsService,
    private counterNotfService: CounterNotificationService,
  ) {
    this.role = sessionStorage.getItem("userRole") || "user";
  }

  ngOnInit(): void {
    this.userName = sessionStorage.getItem("userName") || "User";
    if (!this.isAdmin()) {
      this.getNotifications();
      window.addEventListener("userNameUpdated", this.updateUserName);
      this.counterNotfService.startListening();
      this.counterNotfService.pendingCount$.subscribe((count) => {
        console.log("Pending count updated:", count);
        this.notifications = count;
      });
    }
  }

  ngOnDestroy(): void {
    window.removeEventListener("userNameUpdated", this.updateUserName);
    this.counterNotfService.stopListening();
  }

  getNotifications() {
    this.transactionsService.getPendingTransactions().subscribe((data) => {
      this.counterNotfService.setPendingCount(data.number_pending);
    });
  }

  updateUserName = () => {
    this.userName = sessionStorage.getItem("userName") || "User";
  };

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  toggleUserMenu(): void {
    this.isUserMenuOpen = !this.isUserMenuOpen;
  }

  goToHelp(): void {
    this.router.navigate(["/help"]);
  }

  goToFavorites(): void {
    this.router.navigate(["/friends"]);
  }

  goToTransactions(): void {
    if (this.role === "admin") {
      this.router.navigate(["/admin/transactions"]);
      return;
    }
    this.router.navigate(["/transactions"]);
  }

  goToHome(): void {
    if (this.role === "admin") {
      this.router.navigate(["/admin/home"]);
      return;
    }
    this.router.navigate(["/homepage"]);
  }

  goToSettings(): void {
    this.router.navigate(["/profile"]);
  }

  // Handle Log Out
  logOut(): void {
    sessionStorage.clear();
    this.router.navigate([""]);
  }

  // Admin
  isAdmin(): boolean {
    return this.role === "admin";
  }
  goToUsers(): void {
    this.router.navigate(["/admin/users"]);
  }
  goToAccounts(): void {
    this.router.navigate(["/admin/accounts"]);
  }
}

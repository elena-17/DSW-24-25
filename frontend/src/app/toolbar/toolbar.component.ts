import { Component, OnInit, OnDestroy } from "@angular/core";
import { MatToolbarModule } from "@angular/material/toolbar";
import { CommonModule } from "@angular/common";
import { Router } from "@angular/router";
import { MaterialModule } from "../material.module";
import { MatBadgeModule } from "@angular/material/badge";

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
  eventSource!: EventSource;
  notifications: any[] = [];

  constructor(private router: Router) {
    this.role = sessionStorage.getItem("userRole") || "user";
  }

  ngOnInit(): void {
    this.userName = sessionStorage.getItem("userName") || "User";
    window.addEventListener("userNameUpdated", this.updateUserName);
    this.eventSource = new EventSource(
      `http://localhost:3000/.well-known/mercure?topic=/user/${sessionStorage.getItem("userEmail")}`,
    );
    this.eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      this.notifications.push(data);
      console.log("Notification received:", data);
    };

    this.eventSource.onerror = (error) => {
      console.error("Error en Mercure:", error);
    };
  }

  ngOnDestroy(): void {
    window.removeEventListener("userNameUpdated", this.updateUserName);
    if (this.eventSource) {
      this.eventSource.close();
    }
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

  goToFriends(): void {
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

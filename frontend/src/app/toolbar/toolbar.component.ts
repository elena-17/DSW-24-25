import { Component, OnInit } from "@angular/core";
import { MatIconModule } from "@angular/material/icon";
import { MatToolbarModule } from "@angular/material/toolbar";
import { MatButtonModule } from "@angular/material/button";
import { CommonModule } from "@angular/common";
import { Router } from "@angular/router"; // Si usas Angular Router

@Component({
  selector: "app-toolbar",
  standalone: true,
  imports: [CommonModule, MatIconModule, MatToolbarModule, MatButtonModule],
  templateUrl: "./toolbar.component.html",
  styleUrls: ["./toolbar.component.scss"],
})
export class ToolbarComponent {
  isMenuOpen: boolean = false; //Status menu
  isUserMenuOpen: boolean = false; // Status user menu
  userName: string = "User"; // value for default username

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.userName = sessionStorage.getItem("userName") || "User";
  }

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  toggleUserMenu(): void {
    this.isUserMenuOpen = !this.isUserMenuOpen;
  }

  // Navigate to Help
  goToHelp(): void {
    this.router.navigate(["/help"]);
  }

  // Navigate to Friends
  goToFriends(): void {
    this.router.navigate(["/friends"]);
  }

  // Navigate to Transactions
  goToTransactions(): void {
    this.router.navigate(["/transactions"]);
  }

  // Navigate to Home
  goToHome(): void {
    this.router.navigate(["/homepage"]);
  }

  // Navigate to Settings
  goToSettings(): void {
    this.router.navigate(["/settings"]);
  }

  // Handle Log Out
  logOut(): void {
    sessionStorage.clear();
    this.router.navigate([""]);
  }
}

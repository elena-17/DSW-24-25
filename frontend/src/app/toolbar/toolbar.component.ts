import { Component } from "@angular/core";
import { MatIconModule } from "@angular/material/icon";
import { MatToolbarModule } from "@angular/material/toolbar";
import { MatButtonModule } from "@angular/material/button";
import { CommonModule } from "@angular/common";
import { Router } from "@angular/router"; // Si usas Angular Router

@Component({
  selector: "app-toolbar",
  standalone: true, // Para indicar que es un componente independiente.
  imports: [CommonModule, MatIconModule, MatToolbarModule, MatButtonModule],
  templateUrl: "./toolbar.component.html",
  styleUrls: ["./toolbar.component.scss"],
})
export class ToolbarComponent {
  isMenuOpen: boolean = false; //Status menu
  isUserMenuOpen: boolean = false; // Status user menu

  constructor(private router: Router) {}

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
    sessionStorage.removeItem("userToken");
    console.log("Logging out...");
    this.router.navigate([""]);
  }
}

import { Component, OnInit, OnDestroy } from "@angular/core";
import { MatToolbarModule } from "@angular/material/toolbar";
import { CommonModule } from "@angular/common";
import { Router } from "@angular/router";
import { MaterialModule } from "../material.module";

@Component({
  selector: "app-toolbar",
  standalone: true,
  imports: [CommonModule, MatToolbarModule, MaterialModule],
  templateUrl: "./toolbar.component.html",
  styleUrls: ["./toolbar.component.scss"],
})
export class ToolbarComponent implements OnInit, OnDestroy {
  isMenuOpen: boolean = false; //Status menu
  isUserMenuOpen: boolean = false; // Status user menu
  userName: string = "User"; // value for default username

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.userName = sessionStorage.getItem("userName") || "User";
    window.addEventListener("userNameUpdated", this.updateUserName);
  }
  ngOnDestroy(): void {
    window.removeEventListener("userNameUpdated", this.updateUserName);
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
    this.router.navigate(["/transactions"]);
  }

  goToHome(): void {
    this.router.navigate(["/homepage"]);
  }

  goToSettings1(): void {
    this.router.navigate(["/settings"]);
  }

  goToSettings2(): void {
    this.router.navigate(["/profile"]);
  }

  // Handle Log Out
  logOut(): void {
    sessionStorage.clear();
    this.router.navigate([""]);
  }
}

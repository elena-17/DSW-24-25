import { Component, OnInit } from "@angular/core";
import { ToolbarComponent } from "../toolbar/toolbar.component";
import { MatSnackBar } from "@angular/material/snack-bar";
import { MainService } from "../main.service";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { Router } from "@angular/router";

@Component({
  selector: "app-settings",
  standalone: true,
  imports: [ToolbarComponent, CommonModule, FormsModule],
  templateUrl: "./settings.component.html",
  styleUrl: "./settings.component.scss",
})
export class SettingsComponent {
  userData: any = {};

  constructor(
    private router: Router,
    private snackBar: MatSnackBar,
    private mainService: MainService,
  ) {}

  ngOnInit(): void {
    this.loadUserInfo();
  }

  loadUserInfo(): void {
    this.mainService.getUserProfile().subscribe({
      next: (response) => {
        this.userData = response;
      },
      error: () => {
        this.snackBar.open("Failed to load user data.", "Close", {
          duration: 2000,
          horizontalPosition: "center",
          verticalPosition: "top",
        });
      },
    });
  }

  saveChanges(): void {
    this.mainService.updateUserProfile(this.userData).subscribe({
      next: () => {
        this.snackBar.open("Changes saved successfully!", "Close", {
          duration: 2000,
          horizontalPosition: "center",
          verticalPosition: "top",
        });
      },
      error: () => {
        this.snackBar.open("Failed to save changes.", "Close", {
          duration: 2000,
          horizontalPosition: "center",
          verticalPosition: "top",
        });
      },
    });
  }

  changePassword(): void {
    this.snackBar.open("Redirecting to password change...", "Close", {
      duration: 2000,
    });
  }

  deleteAccount(): void {
    if (
      confirm(
        "Are you sure you want to delete your account? This action cannot be undone.",
      )
    ) {
      this.mainService.deleteUserAccount().subscribe({
        next: () => {
          this.snackBar.open("Account deleted successfully.", "Close", {
            duration: 2000,
          });
          this.router.navigate([""]);
          sessionStorage.clear();
        },
        error: () => {
          this.snackBar.open("Failed to delete account.", "Close", {
            duration: 3000,
          });
        },
      });
    }
  }
}

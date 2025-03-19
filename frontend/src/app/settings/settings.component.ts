import { Component } from "@angular/core";
import { ToolbarComponent } from "../toolbar/toolbar.component";
import { MatSnackBar } from "@angular/material/snack-bar";
import { MainService } from "../main.service";
import { CommonModule } from "@angular/common";
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormsModule } from "@angular/forms";
import { Router } from "@angular/router";
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: "app-settings",
  standalone: true,
  imports: [ToolbarComponent, CommonModule, FormsModule, MatIconModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule],
  templateUrl: "./settings.component.html",
  styleUrl: "./settings.component.scss",
})
export class SettingsComponent {
  settingsForm: FormGroup;
  userData: any = {};
  isFormModified: boolean = false;


  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private snackBar: MatSnackBar,
    private mainService: MainService,
  ) {
    // Create reactive form for settings
    this.settingsForm = this.formBuilder.group({
      email: ["", [Validators.required, Validators.email]],
      phone_number: [
        "",
        [Validators.required, Validators.pattern(/^\d{9}$/)],
      ],
    });
  }

  ngOnInit(): void {
    this.loadUserInfo();
    this.settingsForm.valueChanges.subscribe(() => {
      this.checkFormChanges();
    });
  }

  loadUserInfo(): void {
    this.mainService.getUserProfile().subscribe({
      next: (response) => {
        this.userData = response;
        this.settingsForm.patchValue({
          email: this.userData.email,
          phone_number: this.userData.phone,
          name: this.userData.name,
        });
        this.isFormModified = false;
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

  checkFormChanges(): void {
    this.isFormModified = Object.keys(this.settingsForm.controls).some(
      (key) =>
        this.settingsForm.get(key)?.value !== this.userData[key] && 
        this.settingsForm.get(key)?.valid
    );
  }

  saveChanges(): void {
    if (this.settingsForm.invalid || !this.isFormModified) {
      return;
    }

    const updatedData = this.settingsForm.value;
    this.mainService.updateUserProfile(updatedData).subscribe({
      next: () => {
        this.snackBar.open("Changes saved successfully!", "Close", {
          duration: 2000,
          horizontalPosition: "center",
          verticalPosition: "top",
        });
        this.userData = { ...updatedData };
        this.isFormModified = false;
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
      horizontalPosition: "center",
      verticalPosition: "top",
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
            horizontalPosition: "center",
            verticalPosition: "top",
          });
        },
      });
    }
  }

  getErrorMessage(controlName: string): string {
    const control = this.settingsForm.get(controlName);

    if (!control?.touched && !control?.dirty) {
      return "";
    }

    if (control?.hasError("required")) {
      return `${controlName.charAt(0).toUpperCase() + controlName.slice(1)} is required.`;
    }

    if (control?.hasError("email")) {
      return "Invalid email format.";
    }

    if (control?.hasError("pattern")) {
      if (controlName === "phone_number") {
        return "Phone number must be 9 digits.";
      }
    }

    return "";
  }
}

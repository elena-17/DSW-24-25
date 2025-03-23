import { Component } from "@angular/core";
import { ToolbarComponent } from "../toolbar/toolbar.component";
import { MatSnackBar } from "@angular/material/snack-bar";
import { AuthService } from "../services/auth.service";
import { UserService } from "../services/user.service";
import { CommonModule } from "@angular/common";
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
  FormsModule,
  AbstractControl,
  ValidationErrors,
} from "@angular/forms";
import { Router } from "@angular/router";
import { MatIconModule } from "@angular/material/icon";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { PasswordValidators } from "../password.validators";

@Component({
  selector: "app-settings",
  standalone: true,
  imports: [
    ToolbarComponent,
    CommonModule,
    FormsModule,
    MatIconModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  templateUrl: "./settings.component.html",
  styleUrl: "./settings.component.scss",
})
export class SettingsComponent {
  settingsForm: FormGroup;
  passwordForm: FormGroup;
  userData: any = {};
  isFormModified: boolean = false;
  showPasswordForm: boolean = false;
  hidePassword = true;
  hideConfirmPassword = true;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private snackBar: MatSnackBar,
    private authService: AuthService,
    private userService: UserService,
  ) {
    // Create reactive form for settings
    this.settingsForm = this.formBuilder.group({
      email: ["", [Validators.required, Validators.email]],
      phone: ["", [Validators.required, Validators.pattern(/^\d{9}$/)]],
    });

    // Create reactive form for password change
    this.passwordForm = this.formBuilder.group(
      {
        currentPassword: ["", [Validators.required]],
        password: [
          "",
          [
            Validators.required,
            Validators.minLength(8),
            PasswordValidators.passwordStrengthValidator,
          ],
        ],
        confirmPassword: ["", [Validators.required]],
      },
      { validators: this.passwordMatchValidator },
    );
  }

  ngOnInit(): void {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(["error-page"]);
      return;
    }
    this.loadUserInfo();
    this.settingsForm.valueChanges.subscribe(() => {
      this.checkFormChanges();
    });
  }

  // Hide/show password and confirm password
  togglePasswordVisibility() {
    this.hidePassword = !this.hidePassword;
  }

  toggleConfirmPasswordVisibility() {
    this.hideConfirmPassword = !this.hideConfirmPassword;
  }

  // Mhetod to validate that the passwords match
  passwordMatchValidator(group: AbstractControl): ValidationErrors | null {
    const password = group.get("password")?.value;
    const confirmPassword = group.get("confirmPassword")?.value;
    return password === confirmPassword ? null : { passwordMismatch: true };
  }

  loadUserInfo(): void {
    this.userService.getUserProfile().subscribe({
      next: (response) => {
        this.userData = response;
        this.settingsForm.patchValue({
          email: this.userData.email,
          phone: this.userData.phone,
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
        this.settingsForm.get(key)?.valid,
    );
  }

  saveChanges(): void {
    if (this.settingsForm.invalid || !this.isFormModified) {
      return;
    }
    const updatedData = { ...this.settingsForm.value };

    updatedData.name = this.userData.name;
    updatedData.id_number = this.userData.id_number;
    this.userService.updateUserProfile(updatedData).subscribe({
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

  toggleChangePassword(): void {
    this.showPasswordForm = !this.showPasswordForm;
    if (this.showPasswordForm) {
      this.passwordForm.reset();
    }
  }

  changePassword() {
    if (this.passwordForm.invalid) {
      let errorMessage = "";
      for (const controlName in this.passwordForm.controls) {
        const control = this.passwordForm.get(controlName);
        if (control && control.invalid && (control.touched || control.dirty)) {
          errorMessage += this.getErrorMessage(controlName, "password") + "\n";
        }
      }

      if (errorMessage) {
        this.snackBar.open(errorMessage, "OK", {
          duration: 5000,
          horizontalPosition: "center",
          verticalPosition: "top",
        });
      }
      return;
    }

    const currentPassword = this.passwordForm.get("currentPassword")?.value;
    const password = this.passwordForm.get("password")?.value;
    if (
      confirm(
        "Are you sure you want to change your password? This action cannot be undone.",
      )
    ) {
      this.userService
        .changeUserPassword({ currentPassword, password })
        .subscribe({
          next: () => {
            this.snackBar.open("Password changed successfully!", "Close", {
              duration: 2000,
              horizontalPosition: "center",
              verticalPosition: "top",
            });
            this.showPasswordForm = false;
            this.passwordForm.reset();
          },
          error: (errorMessage) => {
            this.snackBar.open(errorMessage.error?.error, "Close", {
              duration: 2000,
              horizontalPosition: "center",
              verticalPosition: "top",
            });
          },
        });
    }
  }

  deleteAccount(): void {
    if (
      confirm(
        "Are you sure you want to delete your account? This action cannot be undone.",
      )
    ) {
      this.userService.deleteUserAccount().subscribe({
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

  getErrorMessage(
    controlName: string,
    formType: "settings" | "password",
  ): string {
    const form =
      formType === "settings" ? this.settingsForm : this.passwordForm;
    const control = form.get(controlName);

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
      if (controlName === "phone") {
        return "Phone number must be 9 digits.";
      }
    }

    if (control?.hasError("minlength")) {
      return `${controlName.charAt(0).toUpperCase() + controlName.slice(1)} must be at least 8 characters long.`;
    }

    if (control?.hasError("passwordStrength")) {
      return "Password must include uppercase, lowercase, and a number.";
    }

    return "";
  }
}

import { Component } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { PasswordValidators } from "../../password.validators"; // Asegúrate de que esta ruta sea correcta
import { CommonModule } from "@angular/common";
import { ReactiveFormsModule } from "@angular/forms";
import { MatSpinner } from "@angular/material/progress-spinner";
import { MaterialModule } from "../../material.module";
import { AuthService } from "../../services/auth.service";
import { MatSnackBar } from "@angular/material/snack-bar";
import { ActivatedRoute } from "@angular/router";

@Component({
  selector: "app-forgot-password",
  standalone: true,
  imports: [MatSpinner, CommonModule, ReactiveFormsModule, MaterialModule],
  templateUrl: "./forgot-password.component.html",
  styleUrls: ["./forgot-password.component.scss"],
})
export class ForgotPasswordComponent {
  forgotPasswordForm: FormGroup;
  hidePassword = true;
  hideConfirmPassword = true;
  success = false;
  loading = false;
  email: string = "";
  token: string = "";

  constructor(
    private route: ActivatedRoute,
    private snackBar: MatSnackBar,
    private fb: FormBuilder,
    private authService: AuthService,
  ) {
    this.route.queryParams.subscribe((params) => {
      this.email = params["email"];
      this.token = params["token"];
    });

    this.forgotPasswordForm = this.fb.group(
      {
        newPassword: [
          "",
          [
            Validators.required,
            Validators.minLength(8),
            PasswordValidators.passwordStrengthValidator,
          ],
        ],
        confirmPassword: ["", []],
      },
      {
        validator: PasswordValidators.passwordMismatchValidator(
          "newPassword",
          "confirmPassword",
        ),
      },
    );
  }

  // Toggle visibility of password fields
  togglePasswordVisibility(): void {
    this.hidePassword = !this.hidePassword;
  }

  toggleConfirmPasswordVisibility(): void {
    this.hideConfirmPassword = !this.hideConfirmPassword;
  }

  onSubmit(): void {
    if (this.forgotPasswordForm.valid) {
      // Start loading state
      this.loading = true;
      this.success = false; // Reset success state
      const formData = this.forgotPasswordForm.value;
      // Add email and token to formData
      formData.email = this.email;
      formData.token = this.token;

      this.authService.resetPassword(formData).subscribe({
        next: (response) => {
          this.snackBar.open((response as any).message, "Close", {
            duration: 3000,
            horizontalPosition: "center",
            verticalPosition: "top",
          });
          this.loading = false;
          this.success = true;
          setTimeout(() => {
            window.close();
          }, 3000);
        },
        error: (error) => {
          this.snackBar.open(
            error.error.error || "Error while changing password.",
            "Close",
            {
              duration: 3000,
              horizontalPosition: "center",
              verticalPosition: "top",
            },
          );
          this.loading = false;
        },
      });
    }
  }

  getErrorMessage(controlName: string): string {
    const control = this.forgotPasswordForm.get(controlName);
    if (control?.hasError("required")) {
      return `This field is required.`;
    }
    if (control?.hasError("minlength")) {
      return `Must be at least 8 characters long.`;
    }
    if (control?.hasError("passwordStrength")) {
      return "Password must include uppercase, lowercase, and numbers.";
    }
    if (control?.hasError("passwordMismatch")) {
      return "Passwords do not match.";
    }
    return "";
  }
}

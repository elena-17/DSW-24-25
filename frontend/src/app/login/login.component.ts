import { Component } from "@angular/core";
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from "@angular/forms";
import { CommonModule } from "@angular/common";

import { MatSnackBar } from "@angular/material/snack-bar";
import { AuthService } from "../services/auth.service";
import { Router } from "@angular/router";
import { MaterialModule } from "../material.module";

@Component({
  selector: "app-login",
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, MaterialModule],
  templateUrl: "./login.component.html",
  styleUrls: ["./login.component.scss"],
})
export class LoginComponent {
  loginForm: FormGroup;
  email_id: string = "";
  password: string = "";
  hidePassword = true;
  fmodal: FormGroup;
  isModalOpen = false;

  constructor(
    private formBuilder: FormBuilder,
    private fb: FormBuilder,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private router: Router,
  ) {
    this.loginForm = this.formBuilder.group({
      email_id: ["", [Validators.required, this.emailIdValidator()]],
      password: ["", [Validators.required]],
    });
    this.fmodal = this.fb.group({
      email: ["", [Validators.required, Validators.email]],
    });
  }

  openModal(event: Event): void {
    event.preventDefault();
    this.isModalOpen = true;
  }

  closeModal(): void {
    this.isModalOpen = false;
  }

  onSubmitResetPassword(): void {
    if (this.fmodal.invalid) return;

    const formData = this.fmodal.value;

    this.authService.sendResetEmail(formData.email).subscribe({
      next: (response) => {
        this.snackBar.open((response as any).message, "Close", {
          duration: 3000,
          horizontalPosition: "center",
          verticalPosition: "top",
        });
        this.fmodal.reset();
        this.closeModal();
      },
      error: (error) => {
        this.snackBar.open(
          error.error?.message || "Failed to send you the reset link.",
          "Close",
          {
            duration: 3000,
            horizontalPosition: "center",
            verticalPosition: "top",
          },
        );
      },
    });
  }

  onLogin() {
    if (this.loginForm.invalid) {
      this.snackBar.open("Please fill all required fields.", "Close", {
        duration: 3000,
        panelClass: ["error-snackbar"],
      });
      return;
    }
    this.authService
      .login(this.loginForm.value.email_id, this.loginForm.value.password)
      .subscribe({
        next: (response) => {
          sessionStorage.setItem("access_token", response.access);
          sessionStorage.setItem("refresh_token", response.refresh);

          const payload = this.authService.decodeToken(response.access);
          sessionStorage.setItem("userName", payload.name);
          sessionStorage.setItem("userEmail", payload.email);
          sessionStorage.setItem("userRole", payload.role);
          if (payload.role === "admin") {
            this.router.navigate(["admin"]);
          } else {
            // this.snackBar.open("Login successful!", "Close", {
            //   duration: 2000,
            //   horizontalPosition: "center",
            //   verticalPosition: "top",
            // });
            this.router.navigate(["homepage"]);
          }
        },
        error: (error) => {
          this.snackBar.open(error.error?.detail, "Close", {
            duration: 3000,
            horizontalPosition: "center",
            verticalPosition: "top",
          });
        },
      });
  }

  togglePasswordVisibility() {
    this.hidePassword = !this.hidePassword;
  }

  getErrorMessage(controlName: string): string {
    const control = this.loginForm.get(controlName);

    if (control?.hasError("minlength")) {
      return "Password must be at least 8 characters long.";
    }
    if (control?.hasError("passwordStrength")) {
      return "Use at least one number and one uppercase letter.";
    }
    if (controlName === "password") {
      return `${controlName.charAt(0).toUpperCase() + controlName.slice(1)} is required.`;
    }
    return "";
  }

  emailIdValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (!value) {
        return null;
      }
      const emailIdValid =
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value);
      const idNumberValid = /^[0-9]{8}[a-zA-Z]$/.test(value);

      if (!emailIdValid && !idNumberValid) {
        return { email: true };
      }
      return null;
    };
  }
}

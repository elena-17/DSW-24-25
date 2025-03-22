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

import { MatCardModule } from "@angular/material/card";
import { MatInputModule } from "@angular/material/input";
import { MatButtonModule } from "@angular/material/button";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatIconModule } from "@angular/material/icon";
import { MatSnackBar, MatSnackBarModule } from "@angular/material/snack-bar";
import { AuthService } from "../services/auth.service";
import { PasswordValidators } from "../password.validators";
import { Router } from "@angular/router";

@Component({
  selector: "app-login",
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatCardModule,
    MatInputModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatSnackBarModule,
    CommonModule,
  ],
  templateUrl: "./login.component.html",
  styleUrls: ["./login.component.scss"],
})
export class LoginComponent {
  loginForm: FormGroup;
  email_id: string = "";
  password: string = "";
  hidePassword = true;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private router: Router,
  ) {
    this.loginForm = this.formBuilder.group({
      email_id: ["", [Validators.required, this.emailIdValidator()]],
      password: [
        "",
        [
          Validators.required,
          Validators.minLength(8),
          PasswordValidators.passwordStrengthValidator,
        ],
      ],
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
          this.authService.saveToken(response.access);
          this.authService.saveRefreshToken(response.refresh);

          const payload = this.decodeToken(response.access);
          sessionStorage.setItem("userName", payload.name);
          sessionStorage.setItem("userRole", payload.role);

          this.snackBar.open("Login successful!", "Close", {
            duration: 2000,
            horizontalPosition: "center",
            verticalPosition: "top",
          });
          this.router.navigate(["homepage"]);
        },
        error: () => {
          this.snackBar.open("Login failed. Check your credentials.", "Close", {
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
      return "Password must contain at least one number and one uppercase letter.";
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
  private decodeToken(token: string): any {
    try {
      const payload = token.split(".")[1];
      return JSON.parse(atob(payload));
    } catch (e) {
      return null;
    }
  }
}

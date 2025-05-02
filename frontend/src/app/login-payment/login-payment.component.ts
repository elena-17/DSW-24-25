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
import { Router, ActivatedRoute } from "@angular/router";
import { MaterialModule } from "../material.module";
import { TransactionsService } from "../services/transactions.service";

@Component({
  selector: "app-login",
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, MaterialModule],
  templateUrl: "./login-payment.component.html",
  styleUrls: ["./login-payment.component.scss"],
})
export class LoginPaymentComponent {
  loginForm: FormGroup;
  email_id: string = "";
  password: string = "";
  hidePassword = true;
  queryParams: any = {};

  constructor(
    private formBuilder: FormBuilder,
    private fb: FormBuilder,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private router: Router,
    private route: ActivatedRoute,
    private transactionService: TransactionsService,
  ) {
    this.loginForm = this.formBuilder.group({
      email_id: ["", [Validators.required, this.emailIdValidator()]],
      password: ["", [Validators.required]],
    });
    this.route.queryParams.subscribe((params) => {
      this.queryParams = params;

      if (params["email"]) {
        this.loginForm.get("email_id")?.setValue(params["email"]);
        this.loginForm.get("email_id")?.disable(); // <- impedir edición
      }
    });
  }

  onLogin() {
    const formEmail = this.loginForm.getRawValue().email_id;
    if (formEmail !== this.queryParams.email) {
      this.snackBar.open(
        "Email does not match the expected login user.",
        "Close",
        {
          duration: 3000,
          panelClass: ["error-snackbar"],
        },
      );
      return;
    }
    this.authService
      .login(
        this.loginForm.getRawValue().email_id,
        this.loginForm.value.password,
      )
      .subscribe({
        next: (response) => {
          sessionStorage.setItem("access_token", response.access);
          sessionStorage.setItem("refresh_token", response.refresh);

          const payload = this.authService.decodeToken(response.access);
          sessionStorage.setItem("userName", payload.name);
          sessionStorage.setItem("userEmail", payload.email);
          sessionStorage.setItem("userRole", payload.role);
          // Route with parameters
          const query = { ...this.queryParams };
          this.sendConfirmationEmail(query.email, query.confirmation_token);
          this.router.navigate(["/confirm-payment"], { queryParams: query });
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

  sendConfirmationEmail(senderEmail: string, confirmationToken: string) {
    this.transactionService
      .sendConfirmationCode(senderEmail, confirmationToken)
      .subscribe({
        next: () => {
          this.snackBar.open("Confirmation code sent to your email.", "Close", {
            duration: 3000,
            horizontalPosition: "center",
            verticalPosition: "top",
            panelClass: ["success-snackbar"],
          });
        },
        error: (error) => {
          console.error("Error sending confirmation code:", error);
          this.snackBar.open(
            "Failed to send confirmation code. Try again later.",
            "Close",
            {
              duration: 3000,
              horizontalPosition: "center",
              verticalPosition: "top",
              panelClass: ["error-snackbar"],
            },
          );
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

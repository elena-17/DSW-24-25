import { Component } from "@angular/core";
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  AbstractControl,
  ValidationErrors,
} from "@angular/forms";
import { CommonModule } from "@angular/common";
import { MatCardModule } from "@angular/material/card";
import { MatInputModule } from "@angular/material/input";
import { MatButtonModule } from "@angular/material/button";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatIconModule } from "@angular/material/icon";
import { MatSnackBar } from "@angular/material/snack-bar";
import { Router } from "@angular/router";
import { MainService } from "../main.service";

@Component({
  selector: "app-register",
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatInputModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    ReactiveFormsModule,
  ],
  templateUrl: "./register.component.html",
  styleUrl: "./register.component.scss",
})
export class RegisterComponent {
  registerForm: FormGroup;
  hidePassword = true;
  hideConfirmPassword = true;

  constructor(
    private formBuilder: FormBuilder,
    private mainService: MainService,
    private router: Router,
    private snackBar: MatSnackBar,
  ) {
    // Create the registration form
    this.registerForm = this.formBuilder.group(
      {
        email: ["", [Validators.required, Validators.email]],
        phone_number: [
          "",
          [Validators.required, Validators.pattern(/^\d{9}$/)],
        ],
        name: ["", [Validators.required]],
        id_number: [
          "",
          [Validators.required, Validators.pattern(/^\d{8}[a-zA-Z]$/)],
        ],
        pwd1: [
          "",
          [
            Validators.required,
            Validators.minLength(8),
            this.passwordStrengthValidator,
          ],
        ],
        pwd2: ["", [Validators.required, Validators.minLength(8)]],
      },
      // Custom validator for password matching
      { validators: this.passwordMatchValidator },
    );
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
    const password = group.get("pwd1")?.value;
    const confirmPassword = group.get("pwd2")?.value;
    return password === confirmPassword ? null : { passwordMismatch: true };
  }

  // Method to validate the password strength
  passwordStrengthValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (!value) return null;

    const hasUpperCase = /[A-Z]+/.test(value);
    const hasLowerCase = /[a-z]+/.test(value);
    const hasNumeric = /[0-9]+/.test(value);

    return !(hasUpperCase && hasLowerCase && hasNumeric)
      ? { passwordStrength: true }
      : null;
  }

  // Method to get the error message for each form control (Pwd1 and Pwd2 have custom error messages to put Password and Confirm Password)
  getErrorMessage(controlName: string): string {
    const control = this.registerForm.get(controlName);

    if (!control?.touched && !control?.dirty) {
      return "";
    }

    if (controlName === "pwd1" || controlName === "pwd2") {
      if (control?.hasError("required")) {
        return `${controlName === "pwd1" ? "Password" : "Confirm Password"} is required.`;
      }

      if (control?.hasError("minlength")) {
        return `${controlName === "pwd1" ? "Password" : "Confirm Password"} must be at least 8 characters long.`;
      }

      if (
        controlName === "pwd2" &&
        this.registerForm.hasError("passwordMismatch")
      ) {
        return "Passwords do not match";
      }
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
      } else if (controlName === "id_number") {
        return "ID number must be 8 digits followed by 1 letter.";
      }
    }

    if (control?.hasError("minlength")) {
      return `${controlName.charAt(0).toUpperCase() + controlName.slice(1)} must be at least 8 characters long.`;
    }

    if (control?.hasError("passwordStrength")) {
      return "Password must contain at least one number and one uppercase letter.";
    }

    if (this.registerForm.hasError("passwordMismatch")) {
      return "Passwords do not match.";
    }

    return "";
  }

  // Method to register the user
  onRegister() {
    if (this.registerForm.invalid) {
      let errorMessage = "";
      for (const controlName in this.registerForm.controls) {
        const control = this.registerForm.get(controlName);
        if (control && control.invalid && (control.touched || control.dirty)) {
          errorMessage += this.getErrorMessage(controlName) + "\n";
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
    // Going to the backend to register the user
    this.mainService
      .register(
        this.registerForm.value.email,
        this.registerForm.value.phone_number,
        this.registerForm.value.name,
        this.registerForm.value.id_number,
        this.registerForm.value.pwd1,
      )
      .subscribe({
        next: (response) => {
          this.snackBar.open("User registered successfully", "OK", {
            duration: 2000,
            horizontalPosition: "center",
            verticalPosition: "top",
          });

          setTimeout(() => {
            this.router.navigate([""]);
          }, 3000);
        },
        error: (error) => {
          console.error("Registration failed:", error);
          this.snackBar.open("Registration failed. Please try again.", "OK", {
            duration: 2000,
            horizontalPosition: "center",
            verticalPosition: "top",
          });
        },
      });
  }
}

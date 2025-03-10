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

import { MainService } from "../main.service";
import e from "express";

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
    private mainService: MainService,
  ) {
    this.loginForm = this.formBuilder.group({
      email_id: ["", [Validators.required, emailIdValidator()]],
      password: [
        "",
        [
          Validators.required,
          Validators.minLength(8),
          createPasswordStrengthValidator(),
        ],
      ],
    });
  }

  onLogin() {
    if (this.loginForm.invalid) {
      return;
    }
    this.mainService
      .login(this.loginForm.value.email_id, this.loginForm.value.password)
      .subscribe({
        next: (response) => {
          console.log("Login successful:", response);
        },
        error: (error) => {
          console.error("Login failed:", error);
        },
      });
  }

  getErrorMessage(controlName: string): string {
    const control = this.loginForm.get(controlName);
    // if (control?.hasError('required')) {
    //   return `${controlName.charAt(0).toUpperCase() + controlName.slice(1)} is required`;
    // }
    if (control?.hasError("email")) {
      return "Invalid email or ID number";
    }
    if (control?.hasError("minlength")) {
      return "Password must be at least 8 characters long";
    }
    if (control?.hasError("passwordStrength")) {
      return "Password must include uppercase, lowercase, and numbers";
    }
    return "";
  }
}

///////////////////////////////////////////////////////////////////
export function createPasswordStrengthValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    if (!value) {
      return null;
    }
    const hasUpperCase = /[A-Z]+/.test(value);
    const hasLowerCase = /[a-z]+/.test(value);
    const hasNumeric = /[0-9]+/.test(value);
    const passwordValid = hasUpperCase && hasLowerCase && hasNumeric;

    return !passwordValid ? { passwordStrength: true } : null;
  };
}

export function emailIdValidator(): ValidatorFn {
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

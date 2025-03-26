import { Component, HostListener } from "@angular/core";
import { ToolbarComponent } from "../toolbar/toolbar.component";
import { MatSidenavModule } from "@angular/material/sidenav";
import { MatToolbarModule } from "@angular/material/toolbar";
import { MatListModule } from "@angular/material/list";
import { CommonModule } from "@angular/common";
import { MatDialog } from "@angular/material/dialog";
import { DeleteAccountDialogComponent } from "./delete-account-dialog/delete-account-dialog.component";
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
  FormsModule,
} from "@angular/forms";
import { AuthService } from "../services/auth.service";
import { UserService } from "../services/user.service";
import { PasswordValidators } from "../password.validators";
import { Router } from "@angular/router";
import { MaterialModule } from "../material.module";
import { MatSnackBar } from "@angular/material/snack-bar";

@Component({
  selector: "app-profile-page",
  imports: [
    CommonModule,
    ToolbarComponent,
    MatSidenavModule,
    MatToolbarModule,
    MatListModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModule,
  ],
  templateUrl: "./profile-page.component.html",
  styleUrl: "./profile-page.component.scss",
})
export class ProfilePageComponent {
  settingsForm: FormGroup;
  passwordForm: FormGroup;
  userData: any = {};
  isFormModified: boolean = false;
  showPasswordForm: boolean = false;
  hidePassword = true;
  hideConfirmPassword = true;

  constructor(
    private dialog: MatDialog,
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private userService: UserService,
    private router: Router,
    private snackBar: MatSnackBar,
  ) {
    // profile settings form
    this.settingsForm = this.formBuilder.group({
      email: ["", [Validators.required, Validators.email]],
      phone: ["", [Validators.required, Validators.pattern(/^\d{9}$/)]],
      name: ["", [Validators.required]],
    });

    // reactive form for password change
    this.passwordForm = this.formBuilder.nonNullable.group(
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
        confirmPassword: ["", []],
      },
      {
        validators: PasswordValidators.passwordMismatchValidator(
          "password",
          "confirmPassword",
        ),
      },
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

  isDesktop = window.innerWidth > 768;
  @HostListener("window:resize", ["$event"])
  onResize(event: any) {
    this.isDesktop = event.target.innerWidth > 768;
  }

  deleteAccount() {
    const dialogRef = this.dialog.open(DeleteAccountDialogComponent, {
      width: "270px",
    });
  }

  togglePasswordVisibility() {
    this.hidePassword = !this.hidePassword;
  }

  toggleChangePassword(): void {
    this.showPasswordForm = !this.showPasswordForm;
    if (this.showPasswordForm) {
      this.passwordForm.reset();
    }
  }
  toggleConfirmPasswordVisibility() {
    this.hideConfirmPassword = !this.hideConfirmPassword;
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

    updatedData.id_number = this.userData.id_number;
    updatedData.role = sessionStorage.getItem("userRole");
    this.userService.updateUserProfile(updatedData).subscribe({
      next: () => {
        this.snackBar.open("Changes saved successfully!", "Close", {
          duration: 2000,
          horizontalPosition: "center",
          verticalPosition: "top",
        });
        delete updatedData.role;
        this.userData = { ...updatedData };
        this.isFormModified = false;
        sessionStorage.setItem("userName", updatedData.name);
        window.dispatchEvent(new Event("userNameUpdated"));
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

  changePassword() {
    if (this.passwordForm.invalid) {
      return;
    }

    const currentPassword = this.passwordForm.get("currentPassword")?.value;
    const password = this.passwordForm.get("password")?.value;
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

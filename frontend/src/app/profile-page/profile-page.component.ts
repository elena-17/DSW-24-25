import { Component, HostListener } from "@angular/core";
import { ToolbarComponent } from "../toolbar/toolbar.component";
import { MatSidenavModule } from "@angular/material/sidenav";
import { MatToolbarModule } from "@angular/material/toolbar";
import { MatListModule } from "@angular/material/list";
import { CommonModule } from "@angular/common";
import { MatDialog } from "@angular/material/dialog";
import { DeleteAccountDialogComponent } from "./delete-account-dialog/delete-account-dialog.component";
import { ManageCreditcardsComponent } from "./manage-creditcards/manage-creditcards.component";
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
  FormsModule,
} from "@angular/forms";
import { UserService } from "../services/user.service";
import { PasswordValidators } from "../password.validators";
import { MaterialModule } from "../material.module";
import { MatTabsModule } from "@angular/material/tabs";
import { NotificationService } from "../services/notification.service";

@Component({
  selector: "app-profile-page",
  standalone: true,
  imports: [
    CommonModule,
    ToolbarComponent,
    MatSidenavModule,
    MatToolbarModule,
    MatListModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModule,
    MatTabsModule,
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
  creditCards: any[] = [];
  activeSection: string = "profile"; // 'profile' default

  constructor(
    private dialog: MatDialog,
    private formBuilder: FormBuilder,
    private userService: UserService,
    private notificationService: NotificationService,
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
    this.loadUserInfo();
    this.loadCreditCards();
    this.settingsForm.valueChanges.subscribe(() => {
      this.checkFormChanges();
    });
  }

  isDesktop = window.innerWidth > 768;
  @HostListener("window:resize", ["$event"])
  onResize(event: any) {
    this.isDesktop = event.target.innerWidth > 768;
  }

  setActiveSection(section: string): void {
    this.activeSection = section;
  }

  deleteAccount() {
    const dialogRef = this.dialog.open(DeleteAccountDialogComponent, {
      width: "270px",
      data: { type: "account" },
    });
  }

  openAddCardDialog() {
    const dialogRef = this.dialog.open(ManageCreditcardsComponent, {
      data: { title: "Add New Credit Card" },
      width: "75%",
      height: "55%",
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.loadCreditCards();
      }
    });
  }

  editCard(card: any) {
    const dialogRef = this.dialog.open(ManageCreditcardsComponent, {
      data: {
        title: "Edit Credit Card",
        card: card,
      },
      width: "75%",
      height: "50%",
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.loadCreditCards();
      }
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
        this.notificationService.showErrorMessage(
          "Failed to load user information.",
        );
      },
    });
  }

  loadCreditCards(): void {
    this.userService.getCreditCards().subscribe({
      next: (response) => {
        this.creditCards = response;
        this.creditCards.sort((a, b) => a.number.localeCompare(b.number));
      },
      error: () => {
        this.notificationService.showErrorMessage(
          "Failed to load credit cards.",
        );
      },
    });
  }

  deleteCard(card: any): void {
    const dialogRef = this.dialog.open(DeleteAccountDialogComponent, {
      width: "300px",
      data: { type: "creditCard", card: card },
    });
    dialogRef.afterClosed().subscribe((result) => {
      this.loadCreditCards();
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
        this.notificationService.showSuccessMessage(
          "Changes saved successfully!",
        );
        delete updatedData.role;
        this.userData = { ...updatedData };
        this.isFormModified = false;
        sessionStorage.setItem("userName", updatedData.name);
        window.dispatchEvent(new Event("userNameUpdated"));
      },
      error: () => {
        this.notificationService.showErrorMessage(
          "Failed to save changes.",
        );
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
          this.notificationService.showSuccessMessage(
            "Password changed successfully!",
          );
          this.showPasswordForm = false;
          this.passwordForm.reset();
        },
        error: (errorMessage) => {
          this.notificationService.showErrorMessage(
            errorMessage.error?.error || "Failed to change password.",
          );
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

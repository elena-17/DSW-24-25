import { Component, Inject } from "@angular/core";
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from "@angular/forms";
import { CommonModule } from "@angular/common";
import { MatFormFieldModule } from "@angular/material/form-field";

import { PasswordValidators } from "../../password.validators";
import { MaterialModule } from "../../material.module";
import { MatSelectModule } from "@angular/material/select";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";

import { User } from "../admin-users.component";

@Component({
  selector: "app-manage-user",
  imports: [
    CommonModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    MaterialModule,
    MatSelectModule,
  ],
  templateUrl: "./manage-user.component.html",
  styleUrl: "./manage-user.component.scss",
})
export class ManageUserComponent {
  manageUserForm: FormGroup;
  hidePassword = true;
  dialogTitle: string;
  isEditMode: boolean;

  constructor(
    private dialogRef: MatDialogRef<ManageUserComponent>,
    private formBuilder: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: { title: string; user?: User },
  ) {
    this.dialogTitle = data.title;
    // Create the registration form
    this.isEditMode = !!this.data.user;
    this.manageUserForm = this.formBuilder.group({
      email: [
        { value: data.user?.email, disabled: this.isEditMode },
        [Validators.required, Validators.email],
      ],
      phone: [
        data.user?.phone,
        [Validators.required, Validators.pattern(/^\d{9}$/)],
      ],
      name: [data.user?.name, [Validators.required]],
      id_number: [
        data.user?.id_number,
        [Validators.required, Validators.pattern(/^\d{8}[a-zA-Z]$/)],
      ],
      pwd1: [
        "",
        this.isEditMode
          ? [PasswordValidators.conditionalPasswordValidator()]
          : [
              Validators.required,
              Validators.minLength(8),
              PasswordValidators.passwordStrengthValidator,
            ],
      ],
      role: [data.user?.role, [Validators.required]],
      is_confirmed: [this.isEditMode ? data.user?.is_confirmed : true],
    });
  }

  logFormErrors() {
    Object.keys(this.manageUserForm.controls).forEach((key) => {
      const controlErrors = this.manageUserForm.get(key)?.errors;
      if (controlErrors) {
        console.log("Key:", key, "Errors:", controlErrors);
      }
    });
  }

  togglePasswordVisibility() {
    this.hidePassword = !this.hidePassword;
  }

  onSave() {
    if (this.manageUserForm.valid) {
      const formData = { ...this.manageUserForm.value };
      if (formData.id_number) {
        formData.id_number = formData.id_number.toUpperCase();
      }
      if (!formData.pwd1) {
        delete formData.pwd1;
      } else {
        formData.password = formData.pwd1;
        delete formData.pwd1;
      }

      this.dialogRef.close(formData);
    }
  }

  onCancel() {
    this.manageUserForm.reset();
    this.dialogRef.close();
  }

  // Method to get the error message for each form control (Pwd1 and Pwd2 have custom error messages to put Password and Confirm Password)
  getErrorMessage(controlName: string): string {
    const control = this.manageUserForm.get(controlName);

    if (!control?.touched && !control?.dirty) {
      return "";
    }

    if (controlName === "pwd1") {
      if (control?.hasError("required")) {
        return "Password is required.";
      }

      if (control?.hasError("minlength")) {
        return "Password must be at least 8 characters long.";
      }
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
      } else if (controlName === "id_number") {
        return "Must be 8 digits and a letter.";
      }
    }

    if (control?.hasError("minlength")) {
      return `${controlName.charAt(0).toUpperCase() + controlName.slice(1)} must be at least 8 characters long.`;
    }

    if (control?.hasError("passwordStrength")) {
      return "Use at least one number and one uppercase letter.";
    }
    return "";
  }
}

import { Component, Inject } from "@angular/core";
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from "@angular/forms";
import { CommonModule } from "@angular/common";
import { MatFormFieldModule } from "@angular/material/form-field";
import { AuthService } from "../../services/auth.service";
import { PasswordValidators } from "../../password.validators";
import { MaterialModule } from "../../material.module";
import { MatSelectModule } from "@angular/material/select";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";

import { User } from "../admin-users.component";

@Component({
  selector: 'app-manage-user',
  imports: [
    CommonModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    MaterialModule,
    MatSelectModule,
  ],
  templateUrl: './manage-user.component.html',
  styleUrl: './manage-user.component.scss'
})
export class ManageUserComponent {
  manageUserForm: FormGroup;
  hidePassword = true;
  dialogTitle: string;

  constructor(
    private dialogRef: MatDialogRef<ManageUserComponent>,
    private formBuilder: FormBuilder,
    private authServic: AuthService,
    @Inject(MAT_DIALOG_DATA) public data: { title: string,user?: User }
  ) {
    this.dialogTitle = data.title;
    // Create the registration form
    this.manageUserForm = this.formBuilder.group(
      {
        email: [data.user?.email, [Validators.required, Validators.email]],
        phone_number: [
          data.user?.phone,
          [Validators.required, Validators.pattern(/^\d{9}$/)],
        ],
        name: [data.user?.name, [Validators.required]],
        id_number: [
          "",
          [Validators.required, Validators.pattern(/^\d{8}[a-zA-Z]$/)],
        ],
        pwd1: [
          "",
          [
            Validators.required,
            Validators.minLength(8),
            PasswordValidators.passwordStrengthValidator,
          ],
        ],
        role: [data.user?.role, [Validators.required]]
      },
    );
  }

  togglePasswordVisibility() {
    this.hidePassword = !this.hidePassword;
  }

  onSave() {
    if (this.manageUserForm.valid) {
      console.log('User data saved:', this.manageUserForm.value);
      //mandar datos al otro formulario?? no sé si se puede
    }
    this.dialogRef.close();
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

    if (controlName === "pwd1" || controlName === "pwd2") {
      if (control?.hasError("required")) {
        return `${controlName === "pwd1" ? "Password" : "Confirm Password"} is required.`;
      }

      if (control?.hasError("minlength")) {
        return `${controlName === "pwd1" ? "Password" : "Confirm Password"} must be at least 8 characters long.`;
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
      return "Use at least one number and one uppercase letter.";
    }
    return "";
  }

}
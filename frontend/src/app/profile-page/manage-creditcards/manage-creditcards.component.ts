import { Component, Inject } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { MatDialogModule } from "@angular/material/dialog";
import { MatButtonModule } from "@angular/material/button";
import { MatInputModule } from "@angular/material/input";
import { CommonModule } from "@angular/common";
import { MatFormFieldModule } from "@angular/material/form-field";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatSnackBar } from "@angular/material/snack-bar";
import { UserService } from "../../services/user.service";
@Component({
  selector: "app-manage-creditcards",
  imports: [
    MatButtonModule,
    MatInputModule,
    CommonModule,
    MatFormFieldModule,
    FormsModule,
    MatDialogModule,
    ReactiveFormsModule,
  ],
  templateUrl: "./manage-creditcards.component.html",
  styleUrl: "./manage-creditcards.component.scss",
})
export class ManageCreditcardsComponent {
  manageCardForm: FormGroup;
  dialogTitle: string;
  isEditMode: boolean;

  constructor(
    private dialogRef: MatDialogRef<ManageCreditcardsComponent>,
    private formBuilder: FormBuilder,
    private matSnackBar: MatSnackBar,
    private userService: UserService,
    @Inject(MAT_DIALOG_DATA) public data: { title: string; card?: any },
  ) {
    this.dialogTitle = data.title;
    this.isEditMode = !!this.data.card;

    this.manageCardForm = this.formBuilder.group({
      number: [
        data.card?.number,
        [Validators.required, Validators.pattern(/^\d{16}$/)],
      ],
      owner_name: [
        data.card?.owner_name,
        [Validators.required, Validators.maxLength(100)],
      ],
      expiration_date: [
        data.card?.expiration_date,
        [Validators.required, Validators.pattern(/^(0[1-9]|1[0-2])\/\d{2}$/)], // MM/YY
      ],
      card_alias: [data.card?.card_alias, [Validators.maxLength(100)]],
    });
  }

  onSave() {
    if (this.manageCardForm.valid) {
      const formData = this.manageCardForm.value;

      if (this.isEditMode) {
        this.userService.updateCreditCard(formData).subscribe(
          (response) => {
            this.matSnackBar.open("Card updated successfully", "Close", {
              duration: 2000,
              horizontalPosition: "center",
              verticalPosition: "top",
            });
            this.dialogRef.close(response);
          },
          () => {
            this.matSnackBar.open("Error updating card", "Close", {
              duration: 3000,
              horizontalPosition: "center",
              verticalPosition: "top",
            });
          },
        );
      } else {
        this.userService.addCreditCard(formData).subscribe(
          (response) => {
            this.matSnackBar.open("Card added successfully", "Close", {
              duration: 2000,
              horizontalPosition: "center",
              verticalPosition: "top",
            });
            this.dialogRef.close(response);
          },
          () => {
            this.matSnackBar.open("Error adding card", "Close", {
              duration: 3000,
              horizontalPosition: "center",
              verticalPosition: "top",
            });
          },
        );
      }
    }
  }

  onCancel() {
    this.manageCardForm.reset();
    this.dialogRef.close();
  }

  onAccept() {
    this.dialogRef.close();
  }

  getErrorMessage(controlName: string): string {
    const control = this.manageCardForm.get(controlName);
    if (!control?.touched && !control?.dirty) return "";
    if (control?.hasError("required")) {
      return `${controlName.charAt(0).toUpperCase() + controlName.slice(1)} is required.`;
    }
    if (control?.hasError("pattern")) {
      if (controlName === "number") {
        return "Card number must be exactly 16 digits.";
      }
      if (controlName === "expiration_date") {
        return "Expiration date format must be MM/YY.";
      }
    }
    if (control?.hasError("maxlength")) {
      return `${controlName.charAt(0).toUpperCase() + controlName.slice(1)} is too long.`;
    }
    return "";
  }
}

import { Component, Inject } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA  } from "@angular/material/dialog";
import { MatDialogModule } from "@angular/material/dialog";
import { MatButtonModule } from "@angular/material/button";
import { MatInputModule } from "@angular/material/input";
import { CommonModule } from "@angular/common";
import { MatFormFieldModule } from "@angular/material/form-field";
import { FormsModule } from "@angular/forms";

import { UserService } from "../../services/user.service";
import { AuthService } from "../../services/auth.service";
import { MatSnackBar } from "@angular/material/snack-bar";
import { Router } from "@angular/router";

@Component({
  selector: "app-delete-account-dialog",
  templateUrl: "./delete-account-dialog.component.html",
  styleUrls: ["./delete-account-dialog.component.scss"],
  imports: [
    MatDialogModule,
    MatButtonModule,
    MatInputModule,
    CommonModule,
    MatFormFieldModule,
    FormsModule,
  ],
})
export class DeleteAccountDialogComponent {
  confirmationText: string = "";

  constructor(
    private dialogRef: MatDialogRef<DeleteAccountDialogComponent>,
    private userService: UserService,
    private snackBar: MatSnackBar,
    private router: Router,
    @Inject(MAT_DIALOG_DATA) public data: { type: "account" | "creditCard"; card?: string },
  ) {}

  close() {
    this.dialogRef.close();
  }

  confirmDeletion(): void {
    if (this.data.type === "account") {
      this.deleteAccount();
    } else if (this.data.type === "creditCard" && this.data.card) {
      this.deleteCreditCard(this.data.card);
    }
  }

  deleteAccount() {
    this.userService.deleteUserAccount().subscribe({
      next: () => {
        this.snackBar.open("Account deleted successfully.", "Close", {
          duration: 2000,
        });
        this.router.navigate([""]);
        sessionStorage.clear();
      },
      error: () => {
        this.snackBar.open("Failed to delete account.", "Close", {
          duration: 3000,
          horizontalPosition: "center",
          verticalPosition: "top",
        });
      },
    });
    this.dialogRef.close();
  }

  deleteCreditCard(cardNumber: string) {
    this.userService.deleteCreditCard(cardNumber).subscribe({
      next: () => {
        this.snackBar.open("Credit card deleted successfully.", "Close", {
          duration: 2000,
        });
      },
      error: () => {
        this.snackBar.open("Failed to delete credit card.", "Close", {
          duration: 3000,
          horizontalPosition: "center",
          verticalPosition: "top",
        });
      },
    });
    this.dialogRef.close();
  }


}

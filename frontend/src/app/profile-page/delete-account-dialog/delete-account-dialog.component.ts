import { Component } from "@angular/core";
import { MatDialogRef } from "@angular/material/dialog";
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
  ) {}

  close() {
    this.dialogRef.close();
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
}

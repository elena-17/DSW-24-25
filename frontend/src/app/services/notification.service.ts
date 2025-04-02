import { Injectable } from "@angular/core";
import { MatSnackBar } from "@angular/material/snack-bar";

@Injectable({
  providedIn: "root",
})
export class NotificationService {
  constructor(private snackBar: MatSnackBar) {}

  showSuccessMessage(message: string = "Sucess!") {
    this.snackBar.open(message, "OK", {
      duration: 3000,
      horizontalPosition: "center",
      verticalPosition: "top",
    });
  }

  showErrorMessage(message: string = "An error occurred.") {
    this.snackBar.open(`An error occurred. ${message}`, "OK", {
      duration: 3000,
      horizontalPosition: "center",
      verticalPosition: "top",
      panelClass: ["error-snackbar"],
    });
  }
}

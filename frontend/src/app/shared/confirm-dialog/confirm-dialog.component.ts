import { Component, Inject } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { MatDialogModule } from "@angular/material/dialog";
import { MatButtonModule } from "@angular/material/button";

@Component({
  selector: "app-confirm-dialog",
  standalone: true,
  imports: [MatDialogModule, MatButtonModule],
  templateUrl: "./confirm-dialog.component.html",
  styleUrl: "./confirm-dialog.component.scss",
})
export class ConfirmDialogComponent {
  title: string;
  message: string;

  constructor(
    private dialogRef: MatDialogRef<ConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { title: string; message: string },
  ) {
    this.title = data.title || "Confirm Action";
    this.message = data.message || "Are you sure you want to proceed?";
  }

  cancel() {
    this.dialogRef.close(false);
  }

  confirm() {
    this.dialogRef.close(true);
  }
}

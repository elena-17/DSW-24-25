import { Component, Inject } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { MatDividerModule } from "@angular/material/divider";
import { MatCardModule } from "@angular/material/card";
import { MatIconModule } from "@angular/material/icon";
import { MatButtonModule } from "@angular/material/button";
@Component({
  selector: "app-details-transaction",
  imports: [MatDividerModule, MatCardModule, MatIconModule, MatButtonModule],
  templateUrl: "./details-transaction.component.html",
  styleUrl: "./details-transaction.component.scss",
})
export class DetailsTransactionComponent {
  constructor(
    public dialogRef: MatDialogRef<DetailsTransactionComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {}

  close(): void {
    this.dialogRef.close();
  }
}

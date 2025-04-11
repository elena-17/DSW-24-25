import { Component, Inject } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { AdminAccountsService } from '../../services/admin-accounts.service';
import { MaterialModule } from "../../material.module";
import { MatSnackBar } from "@angular/material/snack-bar";
import { CommonModule } from "@angular/common";

@Component({
  selector: 'app-details-accounts',
  imports: [MaterialModule, ReactiveFormsModule, CommonModule],
  templateUrl: './details-accounts.component.html',
  styleUrls: ['./details-accounts.component.scss']
})
export class DetailsAccountsComponent {
  balanceForm: FormGroup;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<DetailsAccountsComponent>,
    private fb: FormBuilder,
    private accountService: AdminAccountsService,
    private snackBar: MatSnackBar
    ) {
      this.balanceForm = this.fb.group({
        name: [{ value: this.data.user || '', disabled: true }],
        balance: [data?.balance || 0, [Validators.required, Validators.min(0), this.decimalMaxTwoValidator]]
      });
    }

    onSave() {
      if (this.balanceForm.invalid) return;
  
      const newBalance = this.balanceForm.get('balance')?.value;
      const email = this.data.user;
  
      this.accountService.updateUserBalance(email, newBalance).subscribe({
        next: (response) => {
          this.snackBar.open((response as any).message || "Balance updated successfully", 'Close', {
            duration: 3000,
            verticalPosition: 'top',
            horizontalPosition: 'center'
          });
          this.dialogRef.close(true); // to trigger refresh
        },
        error: (error) => {
          this.snackBar.open(error.error.error || "Failed to update balance", 'Close', {
            duration: 3000,
            verticalPosition: 'top',
            horizontalPosition: 'center'
          });
        }
      });
    }
  
    onCancel(): void {
      this.dialogRef.close();
    }

  decimalMaxTwoValidator(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;
    const regex = /^\d+(\.\d{1,2})?$/; // Two decimals
    return regex.test(control.value) ? null : { decimalMaxTwo: true };
  }
}

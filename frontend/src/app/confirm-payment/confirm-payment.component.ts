import { Component, QueryList, ViewChildren, ElementRef } from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";
import { CommonModule } from "@angular/common";
import { MaterialModule } from "../material.module";
import { MatSnackBar } from "@angular/material/snack-bar";
import { FormsModule } from "@angular/forms";
import { TransactionsService } from "../services/transactions.service";

@Component({
  selector: 'app-confirm-payment',
  imports: [CommonModule, MaterialModule, FormsModule],
  templateUrl: './confirm-payment.component.html',
  styleUrls: ["./confirm-payment.component.scss"],
})
export class ConfirmPaymentComponent {
  email: string = "";
  token: string = "";
  receiver: string = "";
  confirmationCode = "";
  @ViewChildren("digitInput") digitInputs!: QueryList<ElementRef>;

  constructor(
    private route: ActivatedRoute,
    private snackBar: MatSnackBar,
    private router: Router,
    private transactionService: TransactionsService
  ) {
    this.route.queryParams.subscribe(params => {
      this.email = params['email'] || "";
      this.receiver = params['receiver'] || "";
      this.token = params['token'] || "";
    });
  }

  onDigitChange(value: string, index: number) {
    value = value.replace(/\D/g, ""); // Only digits

    if (!value) return;

    // Replace or append digit at correct index
    this.confirmationCode =
      this.confirmationCode.substring(0, index) +
      value +
      this.confirmationCode.substring(index + 1);

    // Move focus to next
    if (value && index < 5) {
      this.digitInputs.get(index + 1)?.nativeElement.focus();
    }
  }

  onKeyDown(event: KeyboardEvent, index: number) {
    const input = this.digitInputs.get(index)?.nativeElement;
    if (event.key === "Backspace") {
      event.preventDefault();
      this.confirmationCode =
        this.confirmationCode.substring(0, index) +
        "" +
        this.confirmationCode.substring(index + 1);
      input.value = "";
      if (index > 0) {
        this.digitInputs.get(index - 1)?.nativeElement.focus();
      }
    }
  }

  confirmPayment() {
    const payload = {
      receiver: this.receiver,
      sender: this.email,
      code: this.confirmationCode
    };
    this.transactionService.confirmTransactionCode(payload).subscribe({
      next: () => {
        this.snackBar.open("Payment confirmed!", "Close", {
          duration: 3000,
          horizontalPosition: "center",
          verticalPosition: "top",
          panelClass: ["success-snackbar"],
        });
        this.router.navigate(["homepage"]);
      },
      error: (err) => {
        this.snackBar.open("Invalid code or expired link.", "Close", {
          duration: 3000,
          horizontalPosition: "center",
          verticalPosition: "top",
          panelClass: ["error-snackbar"],
        });
        console.error(err);
      }
    });
  }
}

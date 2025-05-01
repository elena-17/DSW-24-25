import { Component } from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";
import { CommonModule } from "@angular/common";
import { MaterialModule } from "../material.module";
import { MatSnackBar } from "@angular/material/snack-bar";
import { FormsModule } from "@angular/forms";

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
  codeDigits: string[] = Array(6).fill("");

  constructor(
    private route: ActivatedRoute,
    private snackBar: MatSnackBar,
    private router: Router
  ) {
    this.route.queryParams.subscribe(params => {
      this.email = params['email'] || "";
      this.receiver = params['receiver'] || "";
      this.token = params['token'] || "";
    });
  }

  autoFocusNext(event: Event, index: number): void {
    const input = event.target as HTMLInputElement;
    if (input.value && index < 5) {
      const nextInput = input.parentElement?.children[index + 1] as HTMLInputElement;
      nextInput?.focus();
    }
  }

  isCodeComplete(): boolean {
    return this.codeDigits.every(d => d !== "");
  }

  confirmPayment() {
    const fullCode = this.codeDigits.join("");

    // Aquí puedes hacer una llamada HTTP al backend para verificar el código
    this.snackBar.open(`Code ${fullCode} confirmed!`, "Close", {
      duration: 3000,
      panelClass: ["success-snackbar"],
    });

    this.router.navigate(["homepage"]);
  }
}

import { Component } from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";
import { CommonModule } from "@angular/common";
import { MaterialModule } from "../material.module";
import { MatSnackBar } from "@angular/material/snack-bar";

@Component({
  selector: 'app-confirm-payment',
  imports: [CommonModule, MaterialModule],
  templateUrl: './confirm-payment.component.html',
  styleUrls: ["./confirm-payment.component.scss"],
})
export class ConfirmPaymentComponent {
  email: string = "";
  token: string = "";
  receiver: string = "";

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

  confirmPayment() {
    // Aquí iría la lógica de confirmación real
    this.snackBar.open("Payment confirmed!", "Close", {
      duration: 3000,
      panelClass: ["success-snackbar"],
    });

    this.router.navigate(["homepage"]);
  }
}

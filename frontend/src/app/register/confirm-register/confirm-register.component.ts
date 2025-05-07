import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { AuthService } from "../../services/auth.service";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatSnackBar } from "@angular/material/snack-bar";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { MatButton } from "@angular/material/button";

@Component({
  selector: "app-confirm-register",
  imports: [
    MatButton,
    MatProgressSpinnerModule,
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
  ],
  templateUrl: "./confirm-register.component.html",
  styleUrls: ["./confirm-register.component.scss"],
})
export class ConfirmRegisterComponent implements OnInit {
  message: string = "";
  success: boolean = false;
  email: string = "";
  token: string = "";

  constructor(
    private route: ActivatedRoute,
    private authService: AuthService,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.email = params["email"];
      this.token = params["token"];
    });
  }

  confirmRegister(): void {
    this.authService.confirmRegistration(this.email, this.token).subscribe({
      next: (response) => {
        this.snackBar.open((response as any).message, "Close", {
          duration: 3000,
          horizontalPosition: "center",
          verticalPosition: "top",
        });
        this.success = true;

        setTimeout(() => {
          window.close();
        }, 3000);
      },
      error: (error) => {
        this.snackBar.open(
          error.error.error || "Error while confirming user.",
          "Close",
          {
            duration: 3000,
            horizontalPosition: "center",
            verticalPosition: "top",
          },
        );
      },
    });
  }
}

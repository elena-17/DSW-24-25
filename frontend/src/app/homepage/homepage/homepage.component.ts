import { Component } from "@angular/core";
import { ToolbarComponent } from "../../toolbar/toolbar.component";
import { UserService } from "../../services/user.service";
import { MatSnackBar } from "@angular/material/snack-bar";
import { CommonModule } from "@angular/common";
import { MatIconModule } from "@angular/material/icon";
import { MatButtonModule } from "@angular/material/button";
import { MatCardModule } from "@angular/material/card";
import { MatDialog } from "@angular/material/dialog";
import { ChangeAccountBalanceComponent } from "./change-account-balance/change-account-balance.component";
@Component({
  selector: "app-homepage",
  standalone: true,
  imports: [
    ToolbarComponent,
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule,
  ],
  templateUrl: "./homepage.component.html",
  styleUrl: "./homepage.component.scss",
})
export class HomepageComponent {
  balance: number = 0; //Default balance
  constructor(
    private userService: UserService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
  ) {}

  ngOnInit() {
    this.loadBalance();
  }

  loadBalance(): void {
    this.userService.getAccountBalance().subscribe({
      next: (response) => {
        this.balance = response.balance;
      },
      error: () => {
        this.snackBar.open("Failed to load balance.", "Close", {
          duration: 2000,
          horizontalPosition: "center",
          verticalPosition: "top",
        });
      },
    });
  }

  depositFunds(): void {
    const dialogRef = this.dialog.open(ChangeAccountBalanceComponent, {
      data: { title: "Deposit", action: "deposit" },
      width: "90%",
      height: "60%",
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.balance = result.balance;
      }
    });
  }

  withdrawFunds(): void {
    const dialogRef = this.dialog.open(ChangeAccountBalanceComponent, {
      data: { title: "Withdraw", action: "withdraw" },
      width: "90%",
      height: "60%",
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.balance = result.balance;
      }
    });
  }
}

import { ChangeDetectorRef, Component, OnInit } from "@angular/core";
import { CommonModule, DatePipe } from "@angular/common";
import { MaterialModule } from "../material.module";
import { ToolbarComponent } from "../toolbar/toolbar.component";
import { TableComponent } from "../shared/table/table.component";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { NotificationService } from "../services/notification.service";
import { MatBadgeModule } from "@angular/material/badge";
import { ReactiveFormsModule, FormBuilder } from "@angular/forms";

import { getAccountsAdminColumns } from "./config/accounts-admin-columns.config";
import { AdminAccountsService } from "../services/admin-accounts.service";
import {
  MatNativeDateModule,
  provideNativeDateAdapter,
} from "@angular/material/core";

import { MatSnackBar } from "@angular/material/snack-bar";
import { DetailsAccountsComponent } from "./details-accounts/details-accounts.component";
import { MatDialog } from "@angular/material/dialog";
@Component({
  selector: "app-admin-accounts",
  providers: [DatePipe, provideNativeDateAdapter()],
  imports: [
    MaterialModule,
    CommonModule,
    ToolbarComponent,
    TableComponent,
    MatDatepickerModule,
    MatBadgeModule,
    MatNativeDateModule,
    ReactiveFormsModule,
  ],
  templateUrl: "./admin-accounts.component.html",
  styleUrls: ["./admin-accounts.component.scss"],
})
export class AdminAccountsComponent implements OnInit {
  columns: any[] = [];
  data: any[] = [];
  filteredData: any[] = [];

  constructor(
    private accountService: AdminAccountsService,
    private snackBar: MatSnackBar,
    private datePipe: DatePipe,
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef, // Importa ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.columns = getAccountsAdminColumns(this.datePipe);
    this.loadAccounts();
  }

  loadAccounts(): void {
    this.accountService.getAllAccounts().subscribe({
      next: (response) => {
        this.data = response;
        this.filteredData = [...this.data]; // Initialize filteredData with the full list of users
        console.log("Accounts loaded successfully", this.data);
      },
      error: (error) => {
        this.snackBar.open(
          error.error.error || "Error loading accounts",
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

  // Filter accounts based on email while typing
  updateSearchFilter(event: any): void {
    const searchTerm = event.target.value.toLowerCase();
    // Filter the accounts based on the email (user)
    this.filteredData = this.data.filter((user) =>
      user.user.toLowerCase().includes(searchTerm),
    );
    // Force change detection. This is only necessary in some cases when Angular doesn't detect changes automatically
    this.cdr.detectChanges();
  }

  // Clear the search filter
  clearFilter(input: HTMLInputElement): void {
    input.value = ""; // Clear the input
    this.filteredData = [...this.data]; // Reset the data to show all accounts
  }

  viewUserDetails($event: any) {
    const selectedRow = $event;
    const dialogRef = this.dialog.open(DetailsAccountsComponent, {
      data: selectedRow,
      width: "60%",
      height: "75%",
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.loadAccounts(); // Refresh the accounts list after closing the dialog
      }
    });
  }
}

import { Component, OnInit } from "@angular/core";
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
      ReactiveFormsModule,],
  templateUrl: "./admin-accounts.component.html",
  styleUrl: "./admin-accounts.component.scss",
})
export class AdminAccountsComponent implements OnInit {

  columns: any[] = [];
  data: any[] = [];

  constructor(
    private accountService: AdminAccountsService,
    private snackBar: MatSnackBar,
    private datePipe: DatePipe
  ) {}

  ngOnInit(): void {
    this.columns = getAccountsAdminColumns(this.datePipe);
    this.loadAccounts();
  }

  loadAccounts(): void {
    this.accountService.getAllAccounts().subscribe({
      next: (response) => {
        this.data = response;
        console.log("Accounts loaded successfully", this.data);
      },
      error: (error) => {
        this.snackBar.open(error.error.error || "Error loading accounts", "Close", {
          duration: 3000,
          horizontalPosition: "center",
          verticalPosition: "top",
        });
      },
    });
  }

  viewUserDetails($event: any) {
    throw new Error('Method not implemented.');
    }
}


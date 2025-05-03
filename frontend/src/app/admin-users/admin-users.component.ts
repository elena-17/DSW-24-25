import {
  Component,
  AfterViewInit,
  ViewChild,
  inject,
  OnInit,
} from "@angular/core";
import { ToolbarComponent } from "../toolbar/toolbar.component";
import { MaterialModule } from "../material.module";
import { MatPaginator } from "@angular/material/paginator";
import { MatTableDataSource } from "@angular/material/table";
import { MatSort } from "@angular/material/sort";
import { SelectionModel } from "@angular/cdk/collections";

import { CommonModule } from "@angular/common";
import { BadgeComponent } from "../shared/badge/badge.component";
import { MatButtonToggleModule } from "@angular/material/button-toggle";

import { MatDialog } from "@angular/material/dialog";
import { ManageUserComponent } from "./manage-user/manage-user.component";
import { AdminUsersService } from "../services/admin-users.service";
import { AuthService } from "../services/auth.service";
import { MatSnackBar } from "@angular/material/snack-bar";

// es necesario?
export interface User {
  id_number: number;
  name: string;
  email: string;
  role: string;
  phone: string;
  is_confirmed: boolean;
}

@Component({
  selector: "app-admin-users",
  imports: [
    ToolbarComponent,
    MaterialModule,
    CommonModule,
    BadgeComponent,
    MatButtonToggleModule,
  ],
  templateUrl: "./admin-users.component.html",
  styleUrls: ["./admin-users.component.scss"],
})
export class AdminUsersComponent implements AfterViewInit, OnInit {
  constructor(
    private dialog: MatDialog,
    private adminUsersService: AdminUsersService,
    private snackBar: MatSnackBar,
  ) {}

  columns = [
    {
      columnDef: "email",
      header: "Email",
      cell: (element: User) => `${element.email}`,
    },
    {
      columnDef: "role",
      header: "Role",
      cell: (element: User) => `${element.role}`,
    },
    {
      columnDef: "id_number",
      header: "ID",
      cell: (element: User) => `${element.id_number}`,
    },
    {
      columnDef: "phone",
      header: "Phone",
      cell: (element: User) => `${element.phone}`,
    },
    {
      columnDef: "name",
      header: "Name",
      cell: (element: User) => `${element.name}`,
    },
  ];

  dataSource = new MatTableDataSource<User>([]);
  displayedColumns = [
    "select",
    ...this.columns.map((c) => c.columnDef),
    "actions",
  ];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  initialSelection = [];
  allowMultiSelect = true;
  selection = new SelectionModel<User>(
    this.allowMultiSelect,
    this.initialSelection,
  );
  selectedRoles: string[] = [];
  searchText: string = "";

  ngOnInit() {
    this.adminUsersService.getUsers().subscribe((all_users) => {
      this.dataSource.data = all_users;
    });
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.dataSource.filterPredicate = this.createFilter();
  }

  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  toggleAllRows() {
    this.isAllSelected()
      ? this.selection.clear()
      : this.dataSource.data.forEach((row) => this.selection.select(row));
  }

  createFilter(): (data: User, filter: string) => boolean {
    return (data: User, filter: string): boolean => {
      const searchObj = JSON.parse(filter);
      const searchText = searchObj.searchText;
      const selectedRoles: string[] = searchObj.selectedRoles;

      const dataStr = (
        data.name +
        " " +
        data.email +
        " " +
        data.role
      ).toLowerCase();

      const textMatch = dataStr.indexOf(searchText) !== -1;

      const roleMatch =
        selectedRoles.length === 0 ||
        selectedRoles.includes(data.role.toLowerCase());

      return textMatch && roleMatch;
    };
  }

  applyCombinedFilter() {
    const filterObj = {
      searchText: this.searchText.trim().toLowerCase(),
      selectedRoles: this.selectedRoles.map((r) => r.toLowerCase()),
    };
    this.dataSource.filter = JSON.stringify(filterObj);
  }

  updateSearchFilter(event: Event) {
    this.searchText = (event.target as HTMLInputElement).value;
    this.applyCombinedFilter();
  }

  applyRoleFilter(event: any) {
    this.selectedRoles = event.value ? event.value : [];
    this.applyCombinedFilter();
  }

  clearFilter(input: HTMLInputElement): void {
    input.value = "";
    this.searchText = "";
    this.applyCombinedFilter();
  }

  addUser() {
    const dialogRef = this.dialog.open(ManageUserComponent, {
      data: { title: "Add User" },
      width: "75%",
      height: "70%",
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.adminUsersService
          .adminRegister(
            result.email,
            result.phone,
            result.name,
            result.id_number,
            result.password,
            result.role,
          )
          .subscribe({
            next: (response) => {
              this.dataSource.data = [result, ...this.dataSource.data];
            },
            error: (error) => {
              console.error("Registration failed:", error);
              console.error("Error message:", error.error);
              this.snackBar.open(
                "Registration failed. Please try again.",
                "OK",
                {
                  duration: 5000,
                  horizontalPosition: "center",
                  verticalPosition: "top",
                },
              );
            },
          });
      }
    });
  }

  editUserButton() {
    // Implement edit user logic here
    const row = this.selection.selected[0];
    this.editUser(row);
  }

  deleteUserButton() {
    // Implement delete user logic here
    if (this.selection.selected.length === 1) {
      this.deleteUser(this.selection.selected[0]);
    } else {
      this.adminUsersService
        .deleteBulkUsers(this.selection.selected.map((user) => user.email))
        .subscribe({
          next: () => {
            this.selection.selected.forEach((user) => {
              const index = this.dataSource.data.findIndex(
                (dataUser) => dataUser.email === user.email,
              );
              if (index !== -1) {
                this.dataSource.data.splice(index, 1);
              }
            });
            this.dataSource._updateChangeSubscription();
            this.selection.clear();
          },
          error: (error) => {
            console.error("Delete failed:", error);
            console.error("Error message:", error.error);
            this.snackBar.open("Delete failed. Please try again.", "OK", {
              duration: 5000,
              horizontalPosition: "center",
              verticalPosition: "top",
            });
          },
        });
    }
  }

  editUser(row: User) {
    const dialogRef = this.dialog.open(ManageUserComponent, {
      data: { title: "Update User", user: row },
      width: "75%",
      height: "70%",
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        if (result.pwd1 === "") {
          delete result.pwd1;
        }
        this.adminUsersService.updateUser(result.email, result).subscribe({
          next: (response) => {
            const index = this.dataSource.data.findIndex(
              (user) => user.id_number === row.id_number,
            );
            if (index !== -1) {
              this.dataSource.data[index] = result;
              this.dataSource._updateChangeSubscription();
            }
          },
          error: (error) => {
            console.error("Update failed:", error);
            console.error("Error message:", error.error);
            this.snackBar.open("Update failed. Please try again.", "OK", {
              duration: 5000,
              horizontalPosition: "center",
              verticalPosition: "top",
            });
          },
        });
      }
    });
  }

  deleteUser(row: User) {
    this.adminUsersService.deleteUser(row.email).subscribe({
      next: () => {
        const index = this.dataSource.data.findIndex(
          (user) => user.id_number === row.id_number,
        );
        if (index !== -1) {
          this.dataSource.data.splice(index, 1);
          this.dataSource._updateChangeSubscription();
        }
      },
      error: (error) => {
        console.error("Delete failed:", error);
        console.error("Error message:", error.error);
        this.snackBar.open("Delete failed. Please try again.", "OK", {
          duration: 5000,
          horizontalPosition: "center",
          verticalPosition: "top",
        });
      },
    });
  }
}

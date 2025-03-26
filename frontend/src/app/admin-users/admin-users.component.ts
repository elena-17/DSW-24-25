import { Component, AfterViewInit, ViewChild, inject } from "@angular/core";
import { ToolbarComponent } from "../toolbar/toolbar.component";
import { MaterialModule } from "../material.module";
import { MatPaginator } from "@angular/material/paginator";
import { MatTableDataSource } from "@angular/material/table";
import { MatSort } from '@angular/material/sort';
import { SelectionModel } from "@angular/cdk/collections";

import { CommonModule } from "@angular/common";
import { BadgeComponent } from "../shared/badge/badge.component";
import { MatButtonToggleModule } from "@angular/material/button-toggle";

import { MatDialog } from "@angular/material/dialog";
import { ManageUserComponent } from "./manage-user/manage-user.component";

// es necesario?
export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  phone: string;
}

//test data
const users: User[] = [
  {
    id: 1,
    name: "John Doe",
    email: "john.doe@example.com",
    role: "Admin",
    phone: "123-456-7890",
  },
  {
    id: 2,
    name: "Jane Smith",
    email: "jane.smith@example.com",
    role: "User",
    phone: "987-654-3210",
  },
  {
    id: 3,
    name: "Alice Johnson",
    email: "alice.johnson@example.com",
    role: "Vendor",
    phone: "555-123-4567",
  },
  {
    id: 4,
    name: "Alice Johnson",
    email: "alice.johnson@example.com",
    role: "other",
    phone: "555-123-4567",
  },
  {
    id: 5,
    name: "Alice Johnson",
    email: "alice.johnson@example.com",
    role: "Vendor",
    phone: "555-123-4567",
  },
];

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
  styleUrl: "./admin-users.component.scss",
})
export class AdminUsersComponent implements AfterViewInit {
  constructor(private dialog: MatDialog) {}

  // borrar esto cuando sea funcional
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
      columnDef: "id",
      header: "ID",
      cell: (element: User) => `${element.id}`,
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


  dataSource = new MatTableDataSource<User>(users);
  displayedColumns = ['select', ...this.columns.map(c => c.columnDef), 'actions'];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  initialSelection = [];
  allowMultiSelect = true;
  selection = new SelectionModel<User>(this.allowMultiSelect, this.initialSelection);
  selectedRoles: string[] = [];
  searchText:string = '';

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
      : this.dataSource.data.forEach(row => this.selection.select(row));
  }

  createFilter(): (data: User, filter: string) => boolean {
    return (data: User, filter: string): boolean => {
      const searchObj = JSON.parse(filter);
      const searchText = searchObj.searchText;
      const selectedRoles: string[] = searchObj.selectedRoles;
      
      const dataStr = (data.name + ' ' + data.email + ' ' + data.role).toLowerCase();
      
      const textMatch = dataStr.indexOf(searchText) !== -1;
      
      const roleMatch = selectedRoles.length === 0 || selectedRoles.includes(data.role.toLowerCase());

      return textMatch && roleMatch;
    };
  }

  applyCombinedFilter() {
    const filterObj = {
      searchText: this.searchText.trim().toLowerCase(),
      selectedRoles: this.selectedRoles.map(r => r.toLowerCase()),
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
    input.value = '';
    this.searchText = '';
    this.applyCombinedFilter();
  }
  
  addUser() {
    // Implement add user logic here
    const dialogRef = this.dialog.open(ManageUserComponent, {
      data: { title: "Add User" },
          width: "75%",
          height: "60%",
        });
    dialogRef.afterClosed().subscribe((result) => {
      if (result){
        console.log('User added:', result);
        this.dataSource.data = [result, ...this.dataSource.data];
      }
    });
    
  }

  editUserButton(){
    // Implement edit user logic here
    const row = this.selection.selected[0];
    this.editUser(row);
  }

  deleteUserButton(){
    // Implement delete user logic here
    if (this.selection.selected.length === 1) {
      this.deleteUser(this.selection.selected[0]);
    }
    else {
    console.log('Delete multiple users');
    }
  }

  editUser(row: User) {
    // Implement edit user logic here
    console.log('Edit user:', row);
  }

  deleteUser(row: User) {
    // Implement delete user logic here
    console.log('Delete user:', row);
  }
}

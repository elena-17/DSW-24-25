import { Component, AfterViewInit, ViewChild } from "@angular/core";
import { ToolbarComponent } from "../toolbar/toolbar.component";
import { MaterialModule } from "../material.module";
import { MatPaginator, MatPaginatorModule } from "@angular/material/paginator";
import { MatTableDataSource, MatTableModule } from "@angular/material/table";

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
    role: "Moderator",
    phone: "555-123-4567",
  },
  {
    id: 3,
    name: "Alice Johnson",
    email: "alice.johnson@example.com",
    role: "Moderator",
    phone: "555-123-4567",
  },
  {
    id: 3,
    name: "Alice Johnson",
    email: "alice.johnson@example.com",
    role: "Moderator",
    phone: "555-123-4567",
  },
];

@Component({
  selector: "app-admin-users",
  imports: [
    ToolbarComponent,
    MaterialModule,
    MatTableModule,
    MatPaginatorModule,
  ],
  templateUrl: "./admin-users.component.html",
  styleUrl: "./admin-users.component.scss",
})
export class AdminUsersComponent implements AfterViewInit {
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
  displayedColumns = this.columns.map((c) => c.columnDef);

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }
}

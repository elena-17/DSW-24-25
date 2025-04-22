import { Component, OnInit } from "@angular/core";
import { MatSnackBar } from "@angular/material/snack-bar";
import { getAdminFriendshipsColumns } from "../config/adminFriendships-columns.config"; // Define columnas
import { FriendshipsService } from "../../services/friendships.service";
import { AdminUsersService } from "../../services/admin-users.service";
import { MatNativeDateModule } from "@angular/material/core";
import { MaterialModule } from "../../material.module";
import { TableComponent } from "../../shared/table/table.component";
import { ToolbarComponent } from "../../toolbar/toolbar.component";
import { CommonModule } from "@angular/common";
import { ReactiveFormsModule } from "@angular/forms";
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-admin-friends',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, ToolbarComponent, MaterialModule, TableComponent],
  templateUrl: './admin-friends.component.html',
  styleUrls: ['./admin-friends.component.scss']
})
export class AdminFriendsComponent {
  favoritePairs: any[] = [];
  columns: any[] = [];
  newRelation = { user: '', favorite_user: '' };
  allUsers: any[] = []; 

  constructor(
    private friendsService: FriendshipsService,
    private adminUsersService: AdminUsersService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.columns = getAdminFriendshipsColumns();
    this.loadAllFavoritePairs();
    this.loadAllUsers();
  }

  onTabChange(event: any): void {
    if (event.index === 1) {
      this.newRelation = { user: '', favorite_user: '' };
    }
  }

  loadAllUsers(): void {
    this.adminUsersService.getUsers().subscribe({
      next: (response) => {
        this.allUsers = response.filter((user: any) => user.role !== 'admin');
      },
      error: () => {
        this.snackBar.open("Error loading users.", "Close", {
          duration: 2000,
          horizontalPosition: "center",
          verticalPosition: "top",
        });
      }
    });
  }

  loadAllFavoritePairs(): void {
    this.friendsService.getAllRelations().subscribe({
      next: (res) => (this.favoritePairs = res),
      error: () => this.snackBar.open("Failed to load favorite pairs", "Close", { duration: 3000, verticalPosition: 'top', horizontalPosition: 'center' })
    });
  }

  addRelation(): void {
    if (!this.newRelation.user || !this.newRelation.favorite_user) return;

    this.friendsService.addRelation(this.newRelation).subscribe({
      next: () => {
        this.snackBar.open("Relation added successfully", "Close", { duration: 3000 });
        this.loadAllFavoritePairs();
        this.newRelation = { user: '', favorite_user: '' };
      },
      error: (err) => {
        this.snackBar.open(err.error?.error || "Failed to add relation", "Close", { duration: 3000 });
      }
    });
  }

  removeRelation(pair: any): void {
    this.friendsService.removeRelation({
      user: pair.user,
      favorite_user: pair.favorite_user
    }).subscribe({
      next: () => {
        this.snackBar.open("Relation removed", "Close", { duration: 3000 });
        this.loadAllFavoritePairs();
      },
      error: () => {
        this.snackBar.open("Failed to remove relation", "Close", { duration: 3000 });
      }
    });
  }
}

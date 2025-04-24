import { Component, OnInit } from "@angular/core";
import { MatSnackBar } from "@angular/material/snack-bar";
import { getAdminFriendshipsColumns } from "../config/adminFriendships-columns.config"; // Define columnas
import { FriendshipsService } from "../../services/friendships.service";
import { AdminUsersService } from "../../services/admin-users.service";
import { MaterialModule } from "../../material.module";
import { TableComponent } from "../../shared/table/table.component";
import { ToolbarComponent } from "../../toolbar/toolbar.component";
import { CommonModule } from "@angular/common";
import { ReactiveFormsModule } from "@angular/forms";
import { FormsModule } from "@angular/forms";
import { NotificationService } from "../../services/notification.service";
import { PageEvent } from "@angular/material/paginator";

@Component({
  selector: "app-admin-friends",
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ToolbarComponent,
    MaterialModule,
    TableComponent,
  ],
  templateUrl: "./admin-friends.component.html",
  styleUrls: ["./admin-friends.component.scss"],
})
export class AdminFriendsComponent {
  favoritePairs: any[] = [];
  totalCount: number = 0;
  pageIndex: number = 0;
  pageSize: number = 5;
  columns: any[] = [];
  newRelation = { user: "", favorite_user: "" };
  allUsers: any[] = [];

  constructor(
    private friendsService: FriendshipsService,
    private adminUsersService: AdminUsersService,
    private notificationService: NotificationService,
  ) {}

  ngOnInit(): void {
    this.columns = getAdminFriendshipsColumns();
    this.loadAllFavoritePairs();
    this.loadAllUsers();
  }

  onTabChange(event: any): void {
    if (event.index === 1) {
      this.newRelation = { user: "", favorite_user: "" };
    }
  }

  loadAllUsers(): void {
    this.adminUsersService.getUsers().subscribe({
      next: (response) => {
        this.allUsers = response.filter((user: any) => user.role !== "admin");
      },
      error: () => {
        this.notificationService.showErrorMessage("Error loading users.");
      },
    });
  }

  loadAllFavoritePairs(): void {
    this.friendsService
      .getAllRelations(this.pageIndex, this.pageSize)
      .subscribe({
        next: (res) => {
          this.favoritePairs = res.data;
          this.totalCount = res.total;
        },
        error: () =>
          this.notificationService.showErrorMessage(
            "Error loading favorite pairs.",
          ),
      });
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadAllFavoritePairs();
  }

  addRelation(): void {
    if (!this.newRelation.user || !this.newRelation.favorite_user) return;

    this.friendsService.addRelation(this.newRelation).subscribe({
      next: () => {
        this.notificationService.showSuccessMessage(
          "Relation added successfully.",
        );
        this.loadAllFavoritePairs();
        this.newRelation = { user: "", favorite_user: "" };
      },
      error: (error) => {
        this.notificationService.showErrorMessage(
          error.error.error || "Failed to add relation.",
        );
      },
    });
  }

  removeRelation(pair: any): void {
    this.friendsService
      .removeRelation({
        user: pair.user,
        favorite_user: pair.favorite_user,
      })
      .subscribe({
        next: () => {
          this.notificationService.showSuccessMessage(
            "Relation removed successfully.",
          );
          this.loadAllFavoritePairs();
        },
        error: (error) => {
          this.notificationService.showErrorMessage(
            error.error.error || "Failed to remove relation.",
          );
        },
      });
  }
}

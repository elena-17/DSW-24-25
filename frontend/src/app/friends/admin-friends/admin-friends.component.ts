import { Component, OnInit } from "@angular/core";
import { MatSnackBar } from "@angular/material/snack-bar";
import { getAdminFriendshipsColumns } from "../config/adminFriendships-columns.config";
import { getAdminBlocksColumns } from "../config/adminBlocks-columns.config";
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
  newRelation = { user: "", favorite_user: "" };

  blockedUsers: any[] = [];
  totalCountBlocked: number = 0;
  pageIndexBlocked: number = 0;
  pageSizeBlocked: number = 5;
  newBlockRelation = { user: "", blocked_user: "" };

  columns: any[] = [];
  columnsBlocked: any[] = [];
  allUsers: any[] = [];

  constructor(
    private friendsService: FriendshipsService,
    private adminUsersService: AdminUsersService,
    private notificationService: NotificationService,
  ) {}

  ngOnInit(): void {
    this.columns = getAdminFriendshipsColumns();
    this.columnsBlocked = getAdminBlocksColumns();
    this.loadAllFavoritePairs();
    this.loadAllUsers();
    this.loadAllBlockedUsers();
  }

  onTabChange(event: any): void {
    if (event.index === 1) {
      this.newRelation = { user: "", favorite_user: "" };
    } else if (event.index === 3) {
      this.newBlockRelation = { user: "", blocked_user: "" };
    }
  }

  loadAllUsers(): void {
    this.adminUsersService.getUsers().subscribe({
      next: (response) => {
        this.allUsers = response.filter(
          (user: any) => user.role !== "admin" && user.role !== "seller",
        );
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

  loadAllBlockedUsers(): void {
    this.friendsService
      .getAllBlocks(this.pageIndexBlocked, this.pageSizeBlocked)
      .subscribe({
        next: (res) => {
          this.blockedUsers = res.data;
          this.totalCountBlocked = res.total;
        },
        error: () =>
          this.notificationService.showErrorMessage(
            "Error loading blocked users.",
          ),
      });
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadAllFavoritePairs();
  }

  onPageChangeBlocked(event: PageEvent): void {
    this.pageIndexBlocked = event.pageIndex;
    this.pageSizeBlocked = event.pageSize;
    this.loadAllBlockedUsers();
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

  addBlockRelation(): void {
    if (!this.newBlockRelation.user || !this.newBlockRelation.blocked_user)
      return;

    this.friendsService.addBlockRelation(this.newBlockRelation).subscribe({
      next: () => {
        this.notificationService.showSuccessMessage(
          "User blocked successfully.",
        );
        this.loadAllBlockedUsers();
        this.newBlockRelation = { user: "", blocked_user: "" };
      },
      error: (error) => {
        this.notificationService.showErrorMessage(
          error.error.error || "Failed to block user.",
        );
      },
    });
  }

  removeBlockRelation(pair: any): void {
    this.friendsService
      .removeAddRelation({
        user: pair.user,
        blocked_user: pair.blocked_user,
      })
      .subscribe({
        next: () => {
          this.notificationService.showSuccessMessage(
            "User unblocked successfully.",
          );
          this.loadAllBlockedUsers();
        },
        error: (error) => {
          this.notificationService.showErrorMessage(
            error.error.error || "Failed to unblock user.",
          );
        },
      });
  }
}

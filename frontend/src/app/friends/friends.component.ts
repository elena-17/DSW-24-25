import {
  ChangeDetectorRef,
  Component,
  OnInit,
  ElementRef,
  ViewChild,
} from "@angular/core";
import { ToolbarComponent } from "../toolbar/toolbar.component";
import { CommonModule } from "@angular/common";
import { MaterialModule } from "../material.module"; // Asegúrate de tener MaterialModule para los componentes de Angular Material
import { MatSnackBar } from "@angular/material/snack-bar";
import { MatDialog } from "@angular/material/dialog";
import { ReactiveFormsModule } from "@angular/forms";
import { getFriendshipsColumns } from "./config/relationships-columns.config"; // Define las columnas de la tabla
import { FriendshipsService } from "../services/friendships.service"; // Servicio para obtener la lista de amigos/favoritos
import { MatBadgeModule } from "@angular/material/badge";
import { MatNativeDateModule } from "@angular/material/core";
import { TableComponent } from "../shared/table/table.component";
import { MatTabChangeEvent } from "@angular/material/tabs";
import { NotificationService } from "../services/notification.service";

@Component({
  selector: "app-friends",
  imports: [
    MaterialModule,
    CommonModule,
    ToolbarComponent,
    TableComponent,
    MatBadgeModule,
    MatNativeDateModule,
    ReactiveFormsModule,
  ],
  templateUrl: "./friends.component.html",
  styleUrls: ["./friends.component.scss"],
})
export class FriendsComponent {
  @ViewChild("inputFavorites") inputFavorites!: ElementRef<HTMLInputElement>;
  @ViewChild("inputAddFavorites")
  inputAddFavorites!: ElementRef<HTMLInputElement>;
  @ViewChild("inputBlocked") inputBlocked!: ElementRef<HTMLInputElement>;
  @ViewChild("inputAddBlocked") inputAddBlocked!: ElementRef<HTMLInputElement>;

  columns: any[] = [];

  favoriteUsers: any[] = [];
  availableUsers: any[] = [];
  filteredFavoriteUsers: any[] = [];
  filteredAvailableUsers: any[] = [];

  blockedUsers: any[] = [];
  filteredBlockedUsers: any[] = [];
  unblockedUsers: any[] = [];
  filteredUnblockedUsers: any[] = [];

  constructor(
    private friendshipsService: FriendshipsService,
    private cdr: ChangeDetectorRef,
    private notificationService: NotificationService,
  ) {}
  ngOnInit(): void {
    this.columns = getFriendshipsColumns();
    this.loadFriendships(); // Charge the data of the friends (favorites)
    this.loadNonFriendships(); // Charge the data of the available users (non-favorites)
    this.loadBlockedUsers(); // Charge the data of the blocked users
    this.loadUnblockedUsers(); // Charge the data of the unblocked users
  }

  // Clear the filter when the user changes the tab
  onTabChange(event: MatTabChangeEvent): void {
    this.inputAddBlocked.nativeElement.value = ""; // Clear the input field for blocked users
    this.inputBlocked.nativeElement.value = ""; // Clear the input field for blocked users
    this.inputFavorites.nativeElement.value = ""; // Clear the input field for favorite users
    this.inputAddFavorites.nativeElement.value = ""; // Clear the input field for available users
    this.updateSearchFilterFavorites({ target: { value: "" } });
    this.updateSearchFilterAvailable({ target: { value: "" } });
    this.updateSearchFilterBlocked({ target: { value: "" } });
    this.updateSearchFilterUnblocked({ target: { value: "" } });
  }

  loadFriendships(): void {
    this.friendshipsService.getAllFriendships().subscribe({
      next: (response) => {
        this.favoriteUsers = response;
        this.filteredFavoriteUsers = [...this.favoriteUsers];
      },
      error: (error) => {
        this.notificationService.showErrorMessage(
          error.error.error || "Error loading friendships",
        );
      },
    });
  }

  loadNonFriendships(): void {
    this.friendshipsService.getNonFriendships().subscribe({
      next: (response) => {
        this.availableUsers = response;
        this.filteredAvailableUsers = []; // Initialize filtered available users empty array
      },
      error: (error) => {
        this.notificationService.showErrorMessage(
          error.error.error || "Can't load available users.",
        );
      },
    });
  }

  loadBlockedUsers(): void {
    this.friendshipsService.getBlockedUsers().subscribe({
      next: (response) => {
        this.blockedUsers = response;
        this.filteredBlockedUsers = [...this.blockedUsers];
      },
      error: (error) => {
        this.notificationService.showErrorMessage(
          error.error.error || "Error loading blocked users",
        );
      },
    });
  }

  loadUnblockedUsers(): void {
    this.friendshipsService.getUnblockedUsers().subscribe({
      next: (response) => {
        this.unblockedUsers = response;
        this.filteredUnblockedUsers = [];
      },
      error: (error) => {
        this.notificationService.showErrorMessage(
          error.error.error || "Error loading unblocked users",
        );
      },
    });
  }

  // Filter favorite users by email while typing
  updateSearchFilterFavorites(event: any): void {
    const searchTerm = event.target.value.toLowerCase();
    this.filteredFavoriteUsers = this.favoriteUsers.filter((user) =>
      user.email.toLowerCase().includes(searchTerm),
    );
    this.cdr.detectChanges();
  }

  clearFilterFavorites(input: HTMLInputElement): void {
    input.value = "";
    this.filteredFavoriteUsers = [...this.favoriteUsers];
  }

  // Filter available users by email while typing
  updateSearchFilterAvailable(event: any): void {
    const searchTerm = event.target.value.toLowerCase();
    if (searchTerm === "") {
      this.filteredAvailableUsers = [];
    } else {
      this.filteredAvailableUsers = this.availableUsers.filter((user) =>
        user.email.toLowerCase().includes(searchTerm),
      );
    }
    this.cdr.detectChanges();
  }

  clearFilterAvailable(input: HTMLInputElement): void {
    input.value = "";
    this.filteredAvailableUsers = [];
  }

  updateSearchFilterBlocked(event: any): void {
    const searchTerm = event.target.value.toLowerCase();
    this.filteredBlockedUsers = this.blockedUsers.filter((user) =>
      user.email.toLowerCase().includes(searchTerm),
    );
    this.cdr.detectChanges();
  }

  clearFilterBlocked(input: HTMLInputElement): void {
    input.value = "";
    this.filteredBlockedUsers = [...this.blockedUsers];
  }

  updateSearchFilterUnblocked(event: any): void {
    const searchTerm = event.target.value.toLowerCase();
    if (searchTerm === "") {
      this.filteredUnblockedUsers = [];
    } else {
      this.filteredUnblockedUsers = this.unblockedUsers.filter((user) =>
        user.email.toLowerCase().includes(searchTerm),
      );
    }
    this.cdr.detectChanges();
  }

  clearFilterUnblocked(input: HTMLInputElement): void {
    input.value = "";
    this.filteredUnblockedUsers = [];
  }

  // Add an user to favorites
  addFavorite(user: any): void {
    this.friendshipsService.addFavorite(user.email).subscribe({
      next: () => {
        this.notificationService.showSuccessMessage(
          `${user.email} has been added to favorites.`,
        );
        //Quitar de available users and add to favorites
        this.availableUsers = this.availableUsers.filter(
          (u) => u.email !== user.email,
        );
        this.filteredAvailableUsers = this.availableUsers;
        this.favoriteUsers = [...this.favoriteUsers, user];
        this.filteredFavoriteUsers = this.favoriteUsers;
      },
      error: () => {
        this.notificationService.showErrorMessage(
          "Can't add user to favorites.",
        );
      },
    });
  }
  // Eliminate an user from favorites
  removeFavorite(user: any): void {
    this.friendshipsService.removeFavorite(user.email).subscribe({
      next: () => {
        this.notificationService.showSuccessMessage(
          `${user.email} has been removed from favorites.`,
        );
        this.favoriteUsers = this.favoriteUsers.filter(
          (u) => u.email !== user.email,
        );
        this.filteredFavoriteUsers = this.favoriteUsers;
        this.availableUsers = [...this.availableUsers, user];
        this.filteredAvailableUsers = this.availableUsers;
      },
      error: () => {
        this.notificationService.showErrorMessage(
          "Can't remove user from favorites.",
        );
      },
    });
  }

  blockUser(user: any): void {
    this.friendshipsService.blockUser(user.email).subscribe({
      next: () => {
        this.notificationService.showSuccessMessage(
          `${user.email} has been blocked.`,
        );
        this.unblockedUsers = this.unblockedUsers.filter(
          (u) => u.email !== user.email,
        );
        this.filteredUnblockedUsers = this.unblockedUsers
        this.blockedUsers = [...this.blockedUsers, user];
        this.filteredBlockedUsers = this.blockedUsers;
      },
      error: () => {
        this.notificationService.showErrorMessage("Can't block user.");
      },
    });
  }

  unblockUser(user: any): void {
    this.friendshipsService.unblockUser(user.email).subscribe({
      next: () => {
        this.notificationService.showSuccessMessage(
          `${user.email} has been unblocked.`,
        );
        this.blockedUsers = this.blockedUsers.filter(
          (u) => u.email !== user.email,
        );
        this.filteredBlockedUsers = this.blockedUsers;
        this.unblockedUsers = [...this.unblockedUsers, user];
        this.filteredUnblockedUsers = this.unblockedUsers;
      },
      error: () => {
        this.notificationService.showErrorMessage("Can't unblock user.");
      },
    });
  }
}

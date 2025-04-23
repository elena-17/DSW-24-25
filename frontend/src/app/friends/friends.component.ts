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

import { getFriendshipsColumns } from "./config/friendships-columns.config"; // Define las columnas de la tabla
import { FriendshipsService } from "../services/friendships.service"; // Servicio para obtener la lista de amigos/favoritos
import { MatBadgeModule } from "@angular/material/badge";
import {
  MatNativeDateModule,
  provideNativeDateAdapter,
} from "@angular/material/core";
import { TableComponent } from "../shared/table/table.component";
import { MatTabChangeEvent } from "@angular/material/tabs";

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

  columns: any[] = [];
  data: any[] = [];
  availableUsers: any[] = [];
  filteredFavoriteUsers: any[] = [];
  filteredAvailableUsers: any[] = [];
  constructor(
    private friendshipsService: FriendshipsService,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef,
    private dialog: MatDialog,
  ) {}
  ngOnInit(): void {
    this.columns = getFriendshipsColumns();
    this.loadFriendships(); // Charge the data of the friends (favorites)
    this.loadNonFriendships(); // Charge the data of the available users (non-favorites)
  }

  // Clear the filter when the user changes the tab
  onTabChange(event: MatTabChangeEvent): void {
    if (event.index === 0) {
      // Favorites tab
      this.inputFavorites.nativeElement.value = ""; // Clear the input field for available users
      console.log(
        "Favorites list filtered loaded successfully",
        this.filteredFavoriteUsers,
      );
    } else if (event.index === 1) {
      // Available tab
      this.inputAddFavorites.nativeElement.value = ""; // Clear the input field for available users
      console.log(
        "Available users filtered loaded successfully",
        this.filteredAvailableUsers,
      );
      console.log("Available users loaded successfully", this.availableUsers);
      this.updateSearchFilterAvailable({ target: { value: "" } }); // Restablecer la búsqueda de disponibles
    }
  }

  loadFriendships(): void {
    this.friendshipsService.getAllFriendships().subscribe({
      next: (response) => {
        this.data = response;
        this.filteredFavoriteUsers = [...this.data];
        console.log("Friendships loaded successfully", this.data);
      },
      error: (error) => {
        this.snackBar.open(
          error.error.error || "Error loading friendships",
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

  loadNonFriendships(): void {
    this.friendshipsService.getNonFriendships().subscribe({
      next: (response) => {
        this.availableUsers = response;
        this.filteredAvailableUsers = []; // Initialize filtered available users empty array
        console.log("Available users loaded successfully.", this.data);
      },
      error: (error) => {
        this.snackBar.open(
          error.error.error || "Error loading available users.",
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

  // Filter favorite users by email while typing
  updateSearchFilterFavorites(event: any): void {
    const searchTerm = event.target.value.toLowerCase();
    this.filteredFavoriteUsers = this.data.filter((user) =>
      user.email.toLowerCase().includes(searchTerm),
    );
    this.cdr.detectChanges();
  }

  clearFilterFavorites(input: HTMLInputElement): void {
    input.value = "";
    this.filteredFavoriteUsers = [...this.data];
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

  // Add an user to favorites
  addFavorite(user: any): void {
    this.friendshipsService.addFavorite(user.email).subscribe({
      next: () => {
        this.snackBar.open(
          `${user.email} has been added to favorites.`,
          "Close",
          {
            duration: 2000,
            horizontalPosition: "center",
            verticalPosition: "top",
          },
        );
        //Quitar de available users and add to favorites
        this.availableUsers = this.availableUsers.filter(
          (u) => u.email !== user.email,
        );
        this.filteredAvailableUsers = this.filteredAvailableUsers.filter(
          (u) => u.email !== user.email,
        );
        this.filteredFavoriteUsers = [...this.filteredFavoriteUsers, user];
      },
      error: () => {
        this.snackBar.open("Error adding user to favorites.", "Close", {
          duration: 2000,
          horizontalPosition: "center",
          verticalPosition: "top",
        });
      },
    });
  }
  // Eliminate an user from favorites
  removeFavorite(user: any): void {
    this.friendshipsService.removeFavorite(user.email).subscribe({
      next: () => {
        this.snackBar.open(
          `${user.email} has been removed from favorites.`,
          "Close",
          {
            duration: 2000,
            horizontalPosition: "center",
            verticalPosition: "top",
          },
        );
        this.filteredFavoriteUsers = this.filteredFavoriteUsers.filter(
          (u) => u.email !== user.email,
        );
        this.availableUsers = [...this.availableUsers, user];
      },
      error: () => {
        this.snackBar.open("Error removing user from favorites.", "Close", {
          duration: 2000,
          horizontalPosition: "center",
          verticalPosition: "top",
        });
      },
    });
  }
}

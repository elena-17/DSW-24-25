import { ChangeDetectorRef, Component, OnInit } from "@angular/core";
import { ToolbarComponent } from "../toolbar/toolbar.component";
import { CommonModule } from "@angular/common";
import { MaterialModule } from "../material.module";  // Asegúrate de tener MaterialModule para los componentes de Angular Material
import { MatSnackBar } from "@angular/material/snack-bar";
import { MatDialog } from "@angular/material/dialog";
import { ReactiveFormsModule } from "@angular/forms";

import { getFriendshipsColumns } from "./config/friendships-columns.config";  // Define las columnas de la tabla
import { FriendshipsService } from "../services/friendships.service";  // Servicio para obtener la lista de amigos/favoritos
import { MatBadgeModule } from "@angular/material/badge";
import { MatNativeDateModule, provideNativeDateAdapter } from "@angular/material/core";
import { TableComponent } from "../shared/table/table.component";


@Component({
  selector: "app-friends",
  imports: [
    MaterialModule,
    CommonModule,
    ToolbarComponent,
    TableComponent,
    MatBadgeModule,
    MatNativeDateModule,
    ReactiveFormsModule,],
  templateUrl: "./friends.component.html",
  styleUrls: ["./friends.component.scss"],
})
export class FriendsComponent {
  isFavorite: boolean = false;  // Estado de favorito
  columns: any[] = [];  // Columnas de la tabla
  data: any[] = [];  // Datos de los usuarios
  favoriteUsers: any[] = [];  // Usuarios favoritos
  availableUsers: any[] = [];  // Usuarios disponibles para agregar a favoritos
  filteredFavoriteUsers: any[] = [];  // Datos filtrados para favoritos
  filteredAvailableUsers: any[] = [];  // Datos filtrados para usuarios disponibles
  constructor(
    private friendshipsService: FriendshipsService,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef,  // Detecta cambios manualmente si es necesario
    private dialog: MatDialog,
  ) {}
  ngOnInit(): void {
    this.columns = getFriendshipsColumns();
    this.loadFriendships();  // Cargar los datos de las amistades (usuarios)
    this.loadNonFriendships();  // Cargar los datos de los no amigos (usuarios disponibles)
  }

  loadFriendships(): void {
    this.friendshipsService.getAllFriendships().subscribe({
      next: (response) => {
        this.data = response;
        this.filteredFavoriteUsers = [...this.data];  // Inicializamos los datos filtrados
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
          }
        );
      },
    });
  }

  loadNonFriendships(): void {
    this.friendshipsService.getNonFriendships().subscribe({
      next: (response) => {
        this.data = response;
        this.filteredAvailableUsers = [...this.data];  // Inicializamos los datos filtrados
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
          }
        );
      },
    });
  }

  // Filtrar las amistades por email o nombre mientras escribes
  updateSearchFilterFavorites(event: any): void {
    const searchTerm = event.target.value.toLowerCase();
    this.filteredFavoriteUsers = this.data.filter((user) =>
      user.email.toLowerCase().includes(searchTerm)
    );
    // Forzar la detección de cambios (solo necesario si Angular no lo hace automáticamente)
    this.cdr.detectChanges();
  }

  // Limpiar el filtro de búsqueda
  clearFilterFavorites(input: HTMLInputElement): void {
    input.value = "";  // Limpiar el campo de búsqueda
    this.filteredFavoriteUsers = [...this.data];  // Restablecer los datos para mostrar todas las amistades
  }

  // Filtrar las amistades por email o nombre mientras escribes
  updateSearchFilterAvailable(event: any): void {
    const searchTerm = event.target.value.toLowerCase();
    this.filteredAvailableUsers = this.data.filter((user) =>
      user.email.toLowerCase().includes(searchTerm)
    );
    // Forzar la detección de cambios (solo necesario si Angular no lo hace automáticamente)
    this.cdr.detectChanges();
  }

  // Limpiar el filtro de búsqueda
  clearFilterAvailable(input: HTMLInputElement): void {
    input.value = "";  // Limpiar el campo de búsqueda
    this.filteredAvailableUsers = [...this.data];  // Restablecer los datos para mostrar todas las amistades
  }

   // Agregar un usuario a favoritos
   addFavorite(user: any): void {
    this.friendshipsService.addFavorite(user.email).subscribe({
      next: () => {
        this.snackBar.open(`${user.name} has been added to favorites.`, "Close", {
          duration: 2000,
          horizontalPosition: "center",
          verticalPosition: "top",
        });
        // Quitar el usuario de la lista de disponibles
        this.availableUsers = this.availableUsers.filter(u => u.email !== user.email);

        // Añadir el usuario a la lista de favoritos
        this.favoriteUsers = [...this.favoriteUsers, user];
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
   // Eliminar un usuario de favoritos
   removeFavorite(user: any): void {
    /*this.friendshipsService.removeFavorite(user.id).subscribe({
      next: () => {
        this.snackBar.open(`${user.name} has been removed from favorites.`, "Close", {
          duration: 2000,
        });
        this.loadFriendships();  // Recargar los datos
      },
      error: () => {
        this.snackBar.open("Error removing user from favorites.", "Close", {
          duration: 2000,
        });
      },
    });*/
  }
}

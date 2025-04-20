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
  filteredData: any[] = [];  // Datos filtrados por búsqueda
  constructor(
    private friendshipsService: FriendshipsService,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef,  // Detecta cambios manualmente si es necesario
    private dialog: MatDialog,
  ) {}
  ngOnInit(): void {
    this.columns = getFriendshipsColumns();
    this.loadFriendships();  // Cargar los datos de las amistades (usuarios)
  }

  loadFriendships(): void {
    this.friendshipsService.getAllFriendships().subscribe({
      next: (response) => {
        this.data = response;
        this.filteredData = [...this.data];  // Inicializamos los datos filtrados
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

  // Filtrar las amistades por email o nombre mientras escribes
  updateSearchFilter(event: any): void {
    const searchTerm = event.target.value.toLowerCase();
    this.filteredData = this.data.filter((user) =>
      user.name.toLowerCase().includes(searchTerm) || 
      user.email.toLowerCase().includes(searchTerm)
    );
    // Forzar la detección de cambios (solo necesario si Angular no lo hace automáticamente)
    this.cdr.detectChanges();
  }

  // Limpiar el filtro de búsqueda
  clearFilter(input: HTMLInputElement): void {
    input.value = "";  // Limpiar el campo de búsqueda
    this.filteredData = [...this.data];  // Restablecer los datos para mostrar todas las amistades
  }

  toggleFavorite($event: any) {
    this.isFavorite = !this.isFavorite;  // Cambiar el estado de favorito}
  }
}

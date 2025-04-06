import { NgModule } from "@angular/core";

import { MatCardModule } from "@angular/material/card";
import { MatInputModule } from "@angular/material/input";
import { MatButtonModule } from "@angular/material/button";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatIconModule } from "@angular/material/icon";
import { MatSnackBarModule } from "@angular/material/snack-bar";
import { MatDialogModule } from "@angular/material/dialog";
import { MatPaginatorModule } from "@angular/material/paginator";
import { MatTableModule } from "@angular/material/table";
import { MatSortModule } from "@angular/material/sort";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { MatChipsModule } from "@angular/material/chips";

@NgModule({
  imports: [
    MatCardModule,
    MatInputModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatSnackBarModule,
    MatDialogModule,
    MatPaginatorModule,
    MatTableModule,
    MatSortModule,
    MatCheckboxModule,
    MatChipsModule,
  ],
  exports: [
    MatCardModule,
    MatInputModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatSnackBarModule,
    MatDialogModule,
    MatPaginatorModule,
    MatTableModule,
    MatSortModule,
    MatCheckboxModule,
    MatChipsModule,
  ],
})
export class MaterialModule {}

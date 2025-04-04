import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatSnackBar } from "@angular/material/snack-bar";
import { MatSpinner } from '@angular/material/progress-spinner'; 

@Component({
  selector: 'app-confirm-register',
  standalone: true,
  imports: [MatSpinner, FormsModule, ReactiveFormsModule, CommonModule],
  templateUrl: './confirm-register.component.html',
  styleUrl: './confirm-register.component.scss'
})
export class ConfirmRegisterComponent implements OnInit{
  message: string = '';
  success: boolean = false;
  email: string = '';

  constructor(
    private route: ActivatedRoute,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit(): void {
    // 🔹 Obtener el email desde la URL
    this.route.queryParams.subscribe(params => {
      this.email = params['email'] || 'correo@hardcodeado.com'; // Valor por defecto si no hay email
    });
  }

  confirmRegister(): void {
    this.authService.confirmRegistration(this.email).subscribe({
      next: (response) => {
        this.snackBar.open('Usuario confirmado correctamente. Se va a proceder a cerrar esta ventana', 'Cerrar', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'top',
        });
        this.success = true;  // Se marca el éxito y muestra el mensaje
        // Cerrar la pestaña después de 3 segundos
        setTimeout(() => {
          window.close();  // Cierra la pestaña actual
        }, 3000); // 3 segundos
      },  
      error: (error) => {
        this.snackBar.open(error.error.message || 'Error al confirmar usuario.', 'Cerrar', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'top',
          panelClass: ['error-snackbar']
        });
      }
    });
  }
        
}

import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatSnackBar } from "@angular/material/snack-bar";
import { MatSpinner } from '@angular/material/progress-spinner'; 
import { MatButton } from '@angular/material/button';

@Component({
  selector: 'app-confirm-register',
  standalone: true,
  imports: [MatButton, MatSpinner, FormsModule, ReactiveFormsModule, CommonModule],
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
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.email = params['email']; 
    });
  }

  confirmRegister(): void {
    this.authService.confirmRegistration(this.email).subscribe({
      next: (response) => {
        this.snackBar.open('Usuario confirmado correctamente. Se va a proceder a cerrar esta ventana', 'Close', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'top',
        });
        this.success = true; 

        setTimeout(() => {
          window.close();  
        }, 3000); 
      },  
      error: (error) => {
        this.snackBar.open(error.error.message || 'Error al confirmar usuario.', 'Close', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'top',
        });
      }
    });
  }
        
}

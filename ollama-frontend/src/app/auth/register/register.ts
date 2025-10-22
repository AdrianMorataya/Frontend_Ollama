import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './register.html',
  styleUrls: ['./register.scss']
})
export class Register {
  username = '';
  email = '';
  password = '';
  role = 'User';
  errorMessage = '';
  successMessage = '';
  showPassword = false;

  constructor(private authService: AuthService, private router: Router) {}

  loading = false;

  register() {
    this.errorMessage = '';
    this.successMessage = '';
    this.loading = true;

    const user = {
      username: this.username,
      email: this.email,
      password: this.password,
      role: this.role
    };

    this.authService.register(user).subscribe({
      next: () => {
        this.successMessage = 'Usuario registrado correctamente';
        setTimeout(() => this.router.navigate(['/auth/verify-email'], { queryParams: { email: this.email } }), 0);
        this.loading = false;
      },
      error: err => {
        if (err.error && typeof err.error === 'string') {
          this.errorMessage = err.error;
        } else if (err.error && err.error.message) {
          this.errorMessage = err.error.message;
        } else {
          this.errorMessage = 'Error al registrarse';
        }
        this.loading = false;
      }
    });
  }

}

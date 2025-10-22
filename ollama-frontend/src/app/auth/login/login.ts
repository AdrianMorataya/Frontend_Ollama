import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.html',
  styleUrls: ['./login.scss']
})
export class Login {
  usernameOrEmail = '';
  password = '';
  errorMessage = '';
  showPassword: boolean = false;
  success = false;

  constructor(private authService: AuthService, private router: Router) {}

  login() {
  this.errorMessage = '';
  this.success = false;

  this.authService.login({ usernameOrEmail: this.usernameOrEmail, password: this.password, success: this.success })
    .subscribe({
      next: res => {
        localStorage.setItem('token', res.token);
        this.success = true;

        setTimeout(() => {
          this.router.navigate(['/ai']);
        }, 1200);
      },
      error: err => {
        this.errorMessage = err.error || 'Error al iniciar sesión';
      }
    });
  }
}
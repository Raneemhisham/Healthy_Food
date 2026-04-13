import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../shared/services/auth.service';
import { LoginRequest } from '../../../shared/interfaces/auth-interface';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {

  email: string = '';
  password: string = '';

  isLoading = false;
  errorMessage = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onLogin() {

    this.errorMessage = '';
    this.isLoading = true;

    const loginData: LoginRequest = {
      email: this.email,
      password: this.password
    };

    this.authService.login(loginData).subscribe({
      next: (res) => {
        console.log('Login Success', res);
        this.router.navigate(['/home']);
      },
      error: (err) => {
        console.log(err);
        this.errorMessage = 'Email or Password is incorrect';
        this.isLoading = false;
      }
    });

  }

}
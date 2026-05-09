import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../shared/services/auth.service';
import { LoginRequest } from '../../../shared/interfaces/auth-interface';
import { environment } from '../../../shared/environment/environment';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {

  email = '';
  password = '';
  isLoading = false;
  errorMessage = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private http: HttpClient
  ) {}

  onLogin() {
    this.errorMessage = '';
    this.isLoading = true;

    const loginData: LoginRequest = { email: this.email, password: this.password };

    this.authService.login(loginData).subscribe({
      next: (res) => {
        const userId = res.data?.userId;
        if (userId) {
          // جيب diseases اليوزر مباشرة بعد اللوجين
          this.http.get<any>(`${environment.apiUrl}/disease-registry/user/${userId}/diseases`).subscribe({
            next: (disRes) => {
              const list = disRes.data || disRes;
              if (Array.isArray(list) && list.length > 0) {
                const d = list[0];
                const name = d.disease?.name || d.diseaseName || '';
                const id   = d.disease?.id   || d.diseaseId   || '';
                if (name) localStorage.setItem('userDiseaseName', name);
                if (id)   localStorage.setItem('userDisease', id);
                // حدّث الـ profile
                const profile = JSON.parse(localStorage.getItem('userProfile') || '{}');
                profile.diseaseIds = list.map((x: any) => x.disease?.id || x.diseaseId);
                localStorage.setItem('userProfile', JSON.stringify(profile));
              }
              this.router.navigate(['/home']);
            },
            error: () => this.router.navigate(['/home'])
          });
        } else {
          this.router.navigate(['/home']);
        }
      },
      error: (err) => {
        this.errorMessage = 'Email or Password is incorrect';
        this.isLoading = false;
      }
    });
  }
}

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, BehaviorSubject, map } from 'rxjs';
import { LoginRequest, LoginResponse, RegisterRequest, UpdateProfileRequest, UserProfile } from '../interfaces/auth-interface';
import { environment } from '../environment/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = `${environment.apiUrl}/auth`;

  private loggedIn = new BehaviorSubject<boolean>(this.hasToken());
  isLoggedIn$ = this.loggedIn.asObservable();

  constructor(private http: HttpClient) {}

  private hasToken(): boolean {
    if (typeof window !== 'undefined' && window.localStorage) {
      return !!localStorage.getItem('accessToken');
    }
    return false;
  }

  login(data: LoginRequest): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, data).pipe(
      tap((res) => {
        const d = res.data;
        if (typeof window !== 'undefined' && d) {
          localStorage.setItem('accessToken', d.token);
          localStorage.setItem('userId', d.userId);
          localStorage.setItem('userProfile', JSON.stringify(d.profile));
        }
        this.loggedIn.next(true);
      }),
      // بعد ما يخزن الـ token، جيب diseases اليوزر من endpoint مستقل
      tap((res) => {
        const userId = res.data?.userId;
        if (userId) {
          // انتظر شوية عشان الـ token يتخزن
          setTimeout(() => {
            this.http.get<any>(`${this.apiUrl.replace('/auth', '')}/disease-registry/user/${userId}/diseases`).subscribe({
              next: (disRes) => {
                const userDiseases = disRes.data || disRes;
                if (Array.isArray(userDiseases) && userDiseases.length > 0) {
                  const firstDisease = userDiseases[0];
                  // خزن الـ disease id والاسم
                  localStorage.setItem('userDisease', firstDisease.disease?.id || firstDisease.diseaseId || '');
                  localStorage.setItem('userDiseaseName', firstDisease.disease?.name || firstDisease.diseaseName || '');
                  // حدّث الـ profile المخزن
                  const profile = JSON.parse(localStorage.getItem('userProfile') || '{}');
                  profile.diseaseIds = userDiseases.map((d: any) => d.disease?.id || d.diseaseId);
                  localStorage.setItem('userProfile', JSON.stringify(profile));
                }
              }
            });
          }, 500);
        }
      })
    );
  }

  register(data: RegisterRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, data);
  }

  logout(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('userId');
      localStorage.removeItem('userDisease');
    }
    this.loggedIn.next(false);
  }

  getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('accessToken');
    }
    return null;
  }

  getUserId(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('userId');
    }
    return null;
  }

  getUserDisease(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('userDisease');
    }
    return null;
  }

  isLoggedIn(): boolean {
    return this.hasToken();
  }

  getProfile(): Observable<UserProfile> {
    return this.http.get<any>(`${this.apiUrl}/profile/me`).pipe(
      tap((res) => {
        // لو الـ response فيه data wrapper، خزنه
        const profile = res.data || res;
        if (typeof window !== 'undefined') {
          localStorage.setItem('userProfile', JSON.stringify(profile));
        }
      }),
      map((res) => res.data || res)
    );
  }

  updateProfile(data: UpdateProfileRequest): Observable<any> {
    return this.http.put(`${this.apiUrl}/profile/me`, data);
  }

  forgotPassword(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/forgot-password`, { email });
  }

  resetPassword(data: { email: string; token: string; newPassword: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/reset-password`, data);
  }
}

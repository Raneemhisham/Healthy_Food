import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, BehaviorSubject } from 'rxjs';
import { LoginRequest, LoginResponse } from '../interfaces/auth-interface';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = 'http://localhost:5000/api/v1/auth';

  private loggedIn = new BehaviorSubject<boolean>(this.hasToken());
  isLoggedIn$ = this.loggedIn.asObservable();

  constructor(private http: HttpClient) {}

  private hasToken(): boolean {
    if (typeof window !== 'undefined' && window.localStorage) {
      return !!localStorage.getItem('accessToken');
    }
    return false;
  }

  login(data: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, data).pipe(
      tap((res) => {

        if (typeof window !== 'undefined') {
          localStorage.setItem('accessToken', res.accessToken);
          localStorage.setItem('refreshToken', res.refreshToken);
          localStorage.setItem('userId', res.userId);
        }

        this.loggedIn.next(true);

      })
    );
  }

  logout(): void {

    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('userId');
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

  isLoggedIn(): boolean {
    return this.hasToken();
  }

  verifyEmail(email:any): Observable<any>{
    return this.http.post("https://ecommerce.routemisr.com/api/v1/auth/forgotPasswords", email)
  }

  verifyCode(code:any): Observable<any>{
    return this.http.post("https://ecommerce.routemisr.com/api/v1/auth/verifyResetCode", code)
  }

  resetPassword(data:any): Observable<any>{
    return this.http.put("https://ecommerce.routemisr.com/api/v1/auth/resetPassword", data)
  }

}
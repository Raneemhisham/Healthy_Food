import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../shared/services/auth.service';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-forget-password',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, CommonModule],
  templateUrl: './forget-password.component.html',
  styleUrl: './forget-password.component.css'
})
export class ForgetPasswordComponent {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  steps = 1;
  apiErrorMessage = '';
  callingAPI = false;
  savedEmail = '';

  // STEP 1 - Send email
  VerifyEmail = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email])
  });

  emailSubmit(form: FormGroup) {
    if (form.invalid) { form.markAllAsTouched(); return; }
    this.callingAPI = true;
    this.apiErrorMessage = '';
    this.savedEmail = form.value.email;

    this.authService.forgotPassword(form.value.email).subscribe({
      next: () => {
        this.callingAPI = false;
        this.steps = 2;
      },
      error: (err) => {
        this.callingAPI = false;
        this.apiErrorMessage = err.error?.message || 'Email not found.';
      }
    });
  }

  // STEP 2 & 3 - Reset password with token
  resetPass = new FormGroup({
    token: new FormControl('', [Validators.required]),
    newPassword: new FormControl('', [
      Validators.required,
      Validators.pattern(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*\-]).{8,}$/)
    ])
  });

  resetSubmit(form: FormGroup) {
    if (form.invalid) { form.markAllAsTouched(); return; }
    this.callingAPI = true;
    this.apiErrorMessage = '';

    const payload = {
      email: this.savedEmail,
      token: form.value.token,
      newPassword: form.value.newPassword
    };

    this.authService.resetPassword(payload).subscribe({
      next: () => {
        this.callingAPI = false;
        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.callingAPI = false;
        this.apiErrorMessage = err.error?.message || 'Invalid or expired token.';
      }
    });
  }

  retriveControl(formGroup: FormGroup, name: string) {
    return formGroup.get(name);
  }
}

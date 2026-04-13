import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../shared/services/auth.service';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-forget-password',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, FormsModule],
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

  // STEP 1
  VerifyEmail = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email])
  });

  emailSubmit(form: FormGroup) {

    this.callingAPI = true;
    this.apiErrorMessage = '';

    this.authService.verifyEmail(form.value).subscribe({
      next: (res: any) => {
        this.callingAPI = false;
        if (res.statusMsg === 'success') {
          this.steps = 2;
        }
      },
      error: (err) => {
        this.callingAPI = false;
        this.apiErrorMessage = err.error?.message;
      }
    });
  }

  // STEP 2
  VerifyCode = new FormGroup({
    resetCode: new FormControl('', [
      Validators.required,
      Validators.pattern(/^\w{6}$/)
    ])
  });

  CodeSubmit(form: FormGroup) {

    this.callingAPI = true;

    this.authService.verifyCode(form.value).subscribe({
      next: (res: any) => {
        this.callingAPI = false;
        if (res.status === 'Success') {
          this.steps = 3;
        }
      },
      error: (err) => {
        this.callingAPI = false;
        this.apiErrorMessage = err.error?.message;
      }
    });
  }

  // STEP 3
  resetPass = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    newPassword: new FormControl('', [
      Validators.required,
      Validators.pattern(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/)
    ])
  });

  resetSubmit(form: FormGroup) {

    this.callingAPI = true;

    this.authService.resetPassword(form.value).subscribe({
      next: (res: any) => {
        this.callingAPI = false;
        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.callingAPI = false;
        this.apiErrorMessage = err.error?.message;
      }
    });
  }

  retriveControl(name: string) {
    if (this.steps === 1) return this.VerifyEmail.get(name);
    if (this.steps === 2) return this.VerifyCode.get(name);
    return this.resetPass.get(name);
  }
}

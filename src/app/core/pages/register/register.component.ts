import { NgIf, NgFor, CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../shared/services/auth.service';
import { ApiService } from '../../../shared/services/api.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [RouterLink, NgIf, NgFor, CommonModule, ReactiveFormsModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent implements OnInit {
  step = 1;
  isLoading = false;
  errorMessage = '';

  diseases: any[] = [];

  step1Form!: FormGroup;
  step2Form!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private apiService: ApiService,
    private router: Router
  ) {}

  ngOnInit() {
    this.step1Form = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      age: ['', [Validators.required, Validators.min(1), Validators.max(120)]],
    });

    this.step2Form = this.fb.group({
      height: ['', [Validators.required, Validators.min(50), Validators.max(250)]],
      weight: ['', [Validators.required, Validators.min(10), Validators.max(300)]],
      gender: ['Male', Validators.required],
      activityLevel: ['Sedentary', Validators.required],
      goal: ['maintain', Validators.required],
      diseaseId: ['', Validators.required],
    });

    // جيب الأمراض من الـ backend
    this.apiService.getDiseases().subscribe({
      next: (res) => {
        // الـ response فيه { success, data: [...] }
        this.diseases = res.data || res;
      },
      error: () => {
        this.diseases = [
          { id: 'e6910cdc-f77d-4cd4-a2d4-8b13e8a329d3', name: 'High Blood Pressure' },
          { id: '5cbbfba7-f024-484b-9e49-0107baa30fa7', name: 'Obesity' },
          { id: '910e99a8-a9c9-4cf4-8344-b73c5931d4bc', name: 'Type 1 Diabetes' },
          { id: '270c6c2b-9400-47d1-929a-4cfaaadc8736', name: 'Type 2 Diabetes' },
          { id: '16c68d59-29e6-4edb-a136-f97d35e665b9', name: 'Underweight' },
        ];
      }
    });
  }

  goToStep2() {
    if (this.step1Form.invalid) {
      this.step1Form.markAllAsTouched();
      return;
    }
    this.step = 2;
  }

  register() {
    if (this.step2Form.invalid) {
      this.step2Form.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const finalData = {
      name: this.step1Form.value.name,
      email: this.step1Form.value.email,
      password: this.step1Form.value.password,
      age: Number(this.step1Form.value.age),
      height: Number(this.step2Form.value.height),
      weight: Number(this.step2Form.value.weight),
      gender: this.step2Form.value.gender,
      activityLevel: this.step2Form.value.activityLevel,
      goal: this.step2Form.value.goal,
      diseaseIds: [this.step2Form.value.diseaseId],  // GUID string
    };

    this.authService.register(finalData).subscribe({
      next: () => {
        // خزن المرض في localStorage عشان الـ home يعرفه
        localStorage.setItem('userDisease', this.step2Form.value.diseaseId);
        // لو الـ API رجع token بعد التسجيل - روح للـ home، غير كدا روح للـ login
        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Registration failed. Please try again.';
        this.isLoading = false;
      }
    });
  }

  getControl(formGroup: FormGroup, name: string) {
    return formGroup.get(name);
  }
}

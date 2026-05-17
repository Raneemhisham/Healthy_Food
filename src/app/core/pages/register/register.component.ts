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
  selectedDiseaseIds: string[] = []; // متعدد

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
    });

    this.apiService.getDiseases().subscribe({
      next: (res) => { this.diseases = res.data || res; },
      error: () => {
        this.diseases = [
          { id: '', name: 'High Blood Pressure' },
          { id: '', name: 'Obesity' },
          { id: '', name: 'Type 1 Diabetes' },
          { id: '', name: 'Type 2 Diabetes' },
          { id: '', name: 'Underweight' },
        ];
      }
    });
  }

  toggleDisease(id: string) {
    const idx = this.selectedDiseaseIds.indexOf(id);
    if (idx === -1) {
      this.selectedDiseaseIds.push(id);
    } else {
      this.selectedDiseaseIds.splice(idx, 1);
    }
  }

  isDiseaseSelected(id: string): boolean {
    return this.selectedDiseaseIds.includes(id);
  }

  goToStep2() {
    if (this.step1Form.invalid) { this.step1Form.markAllAsTouched(); return; }
    this.step = 2;
  }

  register() {
    if (this.step2Form.invalid) { this.step2Form.markAllAsTouched(); return; }
    if (this.selectedDiseaseIds.length === 0) {
      this.errorMessage = 'Please select at least one health condition.';
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
      gender: this.step2Form.value.gender.toLowerCase(),
      activityLevel: this.step2Form.value.activityLevel.toLowerCase(),
      goal: this.step2Form.value.goal,  // already lowercase: lose/maintain/gain
      diseaseIds: this.selectedDiseaseIds,
    };

    this.authService.register(finalData as any).subscribe({
      next: () => {
        // خزّن أول مرض مختار
        if (this.selectedDiseaseIds.length > 0) {
          localStorage.setItem('userDisease', this.selectedDiseaseIds[0]);
        }
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

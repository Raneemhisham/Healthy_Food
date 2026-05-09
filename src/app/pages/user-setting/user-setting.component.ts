import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../shared/services/auth.service';
import { ApiService } from '../../shared/services/api.service';

@Component({
  selector: 'app-user-setting',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './user-setting.component.html',
  styleUrl: './user-setting.component.css'
})
export class UserSettingComponent implements OnInit {
  profileForm!: FormGroup;
  isLoading = false;
  isSaving = false;
  successMessage = '';
  errorMessage = '';
  userProfile: any = null;
  diseases: any[] = [];
  currentDiseaseName = 'None registered';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private apiService: ApiService
  ) {}

  ngOnInit() {
    this.profileForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      height: ['', [Validators.min(50), Validators.max(250)]],
      weight: ['', [Validators.min(10), Validators.max(300)]],
      gender: ['Male'],
      activityLevel: ['Sedentary'],
    });

    this.loadDiseases();
    this.loadProfile();
  }

  loadDiseases() {
    this.apiService.getDiseases().subscribe({
      next: (res: any) => {
        this.diseases = res.data || res;
        this.updateCurrentDiseaseName();
      }
    });
  }

  updateCurrentDiseaseName() {
    // جرب الـ userDiseaseName المخزن أولاً
    const stored = localStorage.getItem('userDiseaseName');
    if (stored) {
      this.currentDiseaseName = stored;
      return;
    }
    // لو مفيش، قارن الـ diseaseIds بالـ diseases list
    const cached = localStorage.getItem('userProfile');
    if (cached && this.diseases.length > 0) {
      try {
        const profile = JSON.parse(cached);
        const id = profile.diseaseIds?.[0];
        if (id) {
          const found = this.diseases.find((d: any) => d.id?.toLowerCase() === id.toLowerCase());
          if (found) this.currentDiseaseName = found.name;
        }
      } catch {}
    }
  }

  loadProfile() {
    this.isLoading = true;
    const cached = localStorage.getItem('userProfile');
    if (cached) {
      try {
        const profile = JSON.parse(cached);
        this.applyProfile(profile);
        this.isLoading = false;
        return;
      } catch {}
    }

    this.authService.getProfile().subscribe({
      next: (profile: any) => {
        this.applyProfile(profile);
        this.isLoading = false;
      },
      error: () => { this.isLoading = false; }
    });
  }

  applyProfile(profile: any) {
    this.userProfile = profile;
    const cap = (s: string) => s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : '';
    this.profileForm.patchValue({
      name: profile.name || '',
      email: profile.email || '',
      height: profile.height || '',
      weight: profile.weight || '',
      gender: cap(profile.gender) || 'Male',
      activityLevel: cap(profile.activityLevel) || 'Sedentary',
    });
  }

  saveChanges() {
    if (this.profileForm.invalid) { this.profileForm.markAllAsTouched(); return; }
    this.isSaving = true;
    this.successMessage = '';
    this.errorMessage = '';

    const payload = {
      ...this.profileForm.value,
      gender: this.profileForm.value.gender?.toLowerCase(),
      activityLevel: this.profileForm.value.activityLevel?.toLowerCase(),
    };

    this.authService.updateProfile(payload).subscribe({
      next: () => {
        this.successMessage = 'Profile updated successfully!';
        this.isSaving = false;
        const updated = { ...this.userProfile, ...payload };
        localStorage.setItem('userProfile', JSON.stringify(updated));
      },
      error: (err: any) => {
        this.errorMessage = err.error?.message || 'Failed to update profile.';
        this.isSaving = false;
      }
    });
  }
}

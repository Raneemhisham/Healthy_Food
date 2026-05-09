import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { HealthPredictionService } from '../../shared/services/health-prediction.service';
import { ApiService } from '../../shared/services/api.service';
import { AuthService } from '../../shared/services/auth.service';
import { CaloriesService } from '../../shared/services/calories.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterLink],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private predictionService = inject(HealthPredictionService);
  private apiService = inject(ApiService);
  private authService = inject(AuthService);
  private caloriesService = inject(CaloriesService);
  private sub = new Subscription();

  showForm = false;
  isModalOpen = false;
  isLoading = false;
  predictionResult: any = null;

  // مرض اليوزر - بيجي من الـ backend بعد اللوجين
  diseaseType: 'hypertension' | 'type1' | 'type2' | null = null;
  diseaseName = '';

  // Calories
  dailyCalories: any = null;
  caloriesLoading = false;

  // Forms
  hypertensionForm!: FormGroup;
  type1Form!: FormGroup;
  type2Form!: FormGroup;

  ngOnInit() {
    this.initForms();
    this.loadUserDiseaseFromProfile();
    this.loadDailyCalories();
    // استمع لأي إضافة calories من recipe-details
    this.sub.add(
      this.caloriesService.foodCalories.subscribe(food => {
        if (this.dailyCalories && food > 0) {
          this.dailyCalories = { ...this.dailyCalories, food };
        }
      })
    );
  }

  ngOnDestroy() { this.sub.unsubscribe(); }

  loadUserDiseaseFromProfile() {
    // أول حاجة جرب الـ userDiseaseName المخزن مباشرة
    const diseaseName = localStorage.getItem('userDiseaseName');
    if (diseaseName) {
      this.mapDiseaseByName(diseaseName);
      return;
    }

    // لو مفيش، جرب الـ userProfile
    const cached = localStorage.getItem('userProfile');
    if (cached) {
      try {
        const profile = JSON.parse(cached);
        if (profile.diseaseIds?.length > 0) {
          const diseaseId = profile.diseaseIds[0];
          this.apiService.getDiseases().subscribe({
            next: (res: any) => {
              const diseases = res.data || res;
              const found = diseases.find((d: any) =>
                d.id?.toLowerCase() === diseaseId.toLowerCase()
              );
              if (found) {
                localStorage.setItem('userDiseaseName', found.name);
                this.mapDiseaseByName(found.name);
              }
            }
          });
          return;
        }
      } catch {}
    }

    // fallback: جيب diseases اليوزر من الـ API مباشرة
    const userId = localStorage.getItem('userId');
    if (userId) {
      this.apiService.getUserDiseases(userId).subscribe({
        next: (res: any) => {
          const userDiseases = res.data || res;
          if (Array.isArray(userDiseases) && userDiseases.length > 0) {
            const name = userDiseases[0].disease?.name || userDiseases[0].diseaseName || '';
            if (name) {
              localStorage.setItem('userDiseaseName', name);
              this.mapDiseaseByName(name);
            }
          }
        }
      });
    }
  }

  mapDiseaseByName(name: string) {
    const n = name?.toLowerCase() || '';
    if (n.includes('blood pressure') || n.includes('hypertension')) {
      this.diseaseType = 'hypertension';
      this.diseaseName = 'High Blood Pressure';
    } else if (n.includes('type 1') || n.includes('type1')) {
      this.diseaseType = 'type1';
      this.diseaseName = 'Type 1 Diabetes';
    } else if (n.includes('type 2') || n.includes('type2')) {
      this.diseaseType = 'type2';
      this.diseaseName = 'Type 2 Diabetes';
    } else if (n.includes('obesity') || n.includes('underweight') || n.includes('metabolic')) {
      this.diseaseType = 'type2';
      this.diseaseName = name;
    } else {
      // لو مش معروف، اعرضه كـ type2
      this.diseaseType = 'type2';
      this.diseaseName = name;
    }
  }

  mapDiseaseIdToType(id: any, name: string) {
    // legacy - still used as fallback
    this.mapDiseaseByName(name || id);
  }

  loadDailyCalories() {
    this.caloriesLoading = true;

    // اقرأ الـ food المحفوظ محلياً أولاً
    const storedToday = localStorage.getItem('todayCalories');
    const localFood = storedToday ? (JSON.parse(storedToday).food || 0) : 0;

    const cached = localStorage.getItem('userProfile');
    if (cached) {
      try {
        const profile = JSON.parse(cached);
        if (profile.dailyCalories) {
          this.dailyCalories = {
            goal: Math.round(profile.dailyCalories),
            food: localFood,
            exercise: 0
          };
          this.caloriesService.setFood(localFood);
        }
      } catch {}
    }

    this.apiService.getDailyCalories().subscribe({
      next: (res) => {
        const data = res.data || res;
        const apiFood = data.totalCaloriesConsumed || data.food || 0;
        // خد الأكبر بين الـ API والـ local عشان محدش يتلغى
        const finalFood = Math.max(apiFood, localFood);

        this.dailyCalories = {
          goal: data.dailyCalorieGoal || data.goal || this.dailyCalories?.goal || 0,
          food: finalFood,
          exercise: data.totalCaloriesBurned || data.exercise || 0,
        };
        const toStore = { ...this.dailyCalories, date: new Date().toDateString() };
        localStorage.setItem('todayCalories', JSON.stringify(toStore));
        this.caloriesService.setFood(finalFood);
        this.caloriesLoading = false;
      },
      error: () => {
        // لو الـ API فشل، استخدم الـ local values
        if (this.dailyCalories) {
          this.dailyCalories.food = localFood;
          this.caloriesService.setFood(localFood);
        }
        this.caloriesLoading = false;
      }
    });
  }

  get caloriesRemaining(): number {
    if (!this.dailyCalories) return 0;
    const goal = this.dailyCalories.goal || 0;
    const food = this.dailyCalories.food || 0;
    const exercise = this.dailyCalories.exercise || 0;
    return goal - food + exercise;
  }

  toggleForm() {
    this.showForm = !this.showForm;
  }

  closeModal() {
    this.isModalOpen = false;
  }

  initForms() {
    this.hypertensionForm = this.fb.group({
      current_sbp: [null, Validators.required],
      current_dbp: [null, Validators.required],
      sodium_mg: [null],
      potassium_mg: [null],
      age: [null, Validators.required],
      gender: ['Male', Validators.required],
      weight: [null, Validators.required],
      on_bp_med: [0]
    });

    this.type1Form = this.fb.group({
      activity_level: ['Moderate', Validators.required],
      baseline_glucose: [null, Validators.required],
      carbs_g: [null],
      meal_calories: [null],
      minutes_since_meal: [15],
      heart_rate: [null],
      insulin_units: [null]
    });

    this.type2Form = this.fb.group({
      glucose_history: ['', Validators.required],
      minutes_since_meal: [0],
      carbs: [0],
      insulin_total: [0],
      hour: [23]
    });
  }

  submitForm() {
    this.isLoading = true;
    let apiCall;

    if (this.diseaseType === 'hypertension') {
      if (this.hypertensionForm.invalid) { this.hypertensionForm.markAllAsTouched(); this.isLoading = false; return; }
      apiCall = this.predictionService.predictHypertension(this.hypertensionForm.value);
    } else if (this.diseaseType === 'type1') {
      if (this.type1Form.invalid) { this.type1Form.markAllAsTouched(); this.isLoading = false; return; }
      apiCall = this.predictionService.predictType1(this.type1Form.value);
    } else if (this.diseaseType === 'type2') {
      if (this.type2Form.invalid) { this.type2Form.markAllAsTouched(); this.isLoading = false; return; }
      const formValue = { ...this.type2Form.value };
      if (typeof formValue.glucose_history === 'string') {
        formValue.glucose_history = formValue.glucose_history
          .split(',')
          .map((val: string) => Number(val.trim()))
          .filter((val: number) => !isNaN(val));
      }
      apiCall = this.predictionService.predictType2(formValue);
    }

    apiCall?.subscribe({
      next: (response) => {
        this.predictionResult = response;
        this.isLoading = false;
        this.isModalOpen = true;
      },
      error: (err) => {
        console.error('Prediction API Error:', err);
        alert('Error connecting to prediction server.');
        this.isLoading = false;
      }
    });
  }
}
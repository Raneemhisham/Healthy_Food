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
  loadingType: 'hypertension' | 'type1' | 'type2' | null = null;
  lastSubmittedType: 'hypertension' | 'type1' | 'type2' | null = null;
  predictionResult: any = null;

  // مرض اليوزر
  diseaseTypes: ('hypertension' | 'type1' | 'type2')[] = [];
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
    // جرب الـ userDiseaseName المخزن
    // const diseaseName = localStorage.getItem('userDiseaseName');
    // if (diseaseName) {
    //   this.addDiseaseByName(diseaseName);
    // }

    // جيب كل أمراض اليوزر من الـ API
    const userId = localStorage.getItem('userId');
  if (!userId) return;

  this.diseaseTypes = []; // reset
  this.diseaseName = '';

  this.apiService.getUserDiseases(userId).subscribe({
    next: (res: any) => {
      const userDiseases = res.data || res;
      if (Array.isArray(userDiseases) && userDiseases.length > 0) {
        const names: string[] = [];
        userDiseases.forEach((ud: any) => {
          const name = ud.disease?.name || ud.diseaseName || '';
          if (name) {
            this.addDiseaseByName(name);
            names.push(name);
          }
        });
        if (names.length > 0) {
          this.diseaseName = names.join(' & ');
          localStorage.setItem('userDiseaseName', names.join(' & '));
        }
      }
    }
  });
  }
  
addDiseaseByName(name: string) {
  const n = name?.toLowerCase() || '';
  let type: 'hypertension' | 'type1' | 'type2' | null = null;

  if (n.includes('blood pressure') || n.includes('hypertension')) {
    type = 'hypertension';
  } else if (n.includes('type 1') || n.includes('type1')) {
    type = 'type1';
  } else if (n.includes('type 2') || n.includes('type2')) {
    type = 'type2';
  }

  if (type && !this.diseaseTypes.includes(type)) {
    this.diseaseTypes.push(type);
  }
  if (!this.diseaseName) this.diseaseName = name;
}

  // legacy
  mapDiseaseByName(name: string) { this.addDiseaseByName(name); }
  mapDiseaseIdToType(id: any, name: string) { this.addDiseaseByName(name || id); }

  loadDailyCalories() {
    this.caloriesLoading = true;

    // اقرأ الـ food الخاص بالـ user الحالي
    const localFood = this.caloriesService.getStoredFood();

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
        const apiFood = data.consumedCalories || 0;
        // خد الأكبر بين الـ API والـ local عشان محدش يتلغى
        const finalFood = Math.max(apiFood, localFood);

        this.dailyCalories = {
          goal: data.targetCalories || this.dailyCalories?.goal || 0,
          food: finalFood,
          exercise: 0 || 0,
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
    gender: ['male', Validators.required],
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
      insulin_units: [null],
      height_cm: [null],
      weight_kg: [null],
      age: [null, Validators.required],
      gender: ['male', Validators.required],
    });

    this.type2Form = this.fb.group({
    glucose_history: ['5,4,5', Validators.required],
    minutes_since_meal: [360],
    carbs: [200],
    insulin_total: [40],
    hour: [23]
    });
  }

  submitForm(formType: 'hypertension' | 'type1' | 'type2') {
    this.loadingType = formType;
    let apiCall;

    if (formType === 'hypertension') {
      if (this.hypertensionForm.invalid) { this.hypertensionForm.markAllAsTouched(); this.loadingType = null; return; }
      apiCall = this.predictionService.predictHypertension(this.hypertensionForm.value);
    } else if (formType === 'type1') {
      if (this.type1Form.invalid) { this.type1Form.markAllAsTouched(); this.loadingType = null; return; }
      apiCall = this.predictionService.predictType1(this.type1Form.value);
    } else if (formType === 'type2') {
  if (this.type2Form.invalid) {
    this.type2Form.markAllAsTouched();
    this.loadingType = null;
    return;
  }
  const formValue = { ...this.type2Form.value };
  if (typeof formValue.glucose_history === 'string') {
    formValue.glucose_history = formValue.glucose_history
      .split(',')
      .map((val: string) => Number(val.trim()))
      .filter((val: number) => !isNaN(val));
  }
  if (formValue.glucose_history.length < 3) {
    alert('Please enter at least 3 glucose readings separated by commas (e.g. 5, 4, 5)');
    this.loadingType = null;
    return;
  }
  apiCall = this.predictionService.predictType2(formValue);
}

    apiCall?.subscribe({
      next: (response) => {
        this.predictionResult = response;
        this.lastSubmittedType = formType;
        this.loadingType = null;
        this.isModalOpen = true;
      },
      error: (err) => {
        console.error('Prediction API Error:', err);
        alert('Error: ' + (err.error?.message || 'Could not connect to prediction server.'));
        this.loadingType = null;
      }
    });
  }
}

import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { HealthPredictionService } from '../../shared/services/health-prediction.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {
  private fb = inject(FormBuilder);
  private predictionService = inject(HealthPredictionService);

  showForm = false;
  isModalOpen = false;
  isLoading = false;
  predictionResult: any = null;

  // متغير مؤقت للتجربة، هنمسحه لما الـ Register يخلص
  diseaseType: 'hypertension' | 'type1' | 'type2' = 'hypertension';

  // Forms
  hypertensionForm!: FormGroup;
  type1Form!: FormGroup;
  type2Form!: FormGroup;

  ngOnInit() {
    this.initForms();
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
      // خلينا الـ Default بتاعها String فاضي عشان اليوزر يكتب الأرقام بفاصلة
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
      apiCall = this.predictionService.predictHypertension(this.hypertensionForm.value);
    } else if (this.diseaseType === 'type1') {
      apiCall = this.predictionService.predictType1(this.type1Form.value);
    } else if (this.diseaseType === 'type2') {
      
      const formValue = { ...this.type2Form.value };
      
      // تحويل النص "4,5,3,1,2" إلى مصفوفة أرقام [4, 5, 3, 1, 2]
      if (typeof formValue.glucose_history === 'string') {
        formValue.glucose_history = formValue.glucose_history
          .split(',')
          .map((val: string) => Number(val.trim())) // نشيل المسافات ونحول لرقم
          .filter((val: number) => !isNaN(val));    // نتأكد إن مفيش حروف دخلت بالغلط
      }
      
      apiCall = this.predictionService.predictType2(formValue);
    }

    apiCall?.subscribe({
      next: (response) => {
        this.predictionResult = response;
        this.isLoading = false;
        this.isModalOpen = true; // فتح الـ Modal عند النجاح
      },
      error: (err) => {
        console.error('API Error:', err);
        alert('حدث خطأ أثناء الاتصال بالخادم.');
        this.isLoading = false;
      }
    });
  }
}
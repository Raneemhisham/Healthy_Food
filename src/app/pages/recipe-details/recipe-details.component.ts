import { Component, OnInit } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { Router } from '@angular/router';
import { ApiService } from '../../shared/services/api.service';
import { CaloriesService } from '../../shared/services/calories.service';

@Component({
  selector: 'app-recipe-details',
  standalone: true,
  imports: [CommonModule, DecimalPipe],
  templateUrl: './recipe-details.component.html',
  styleUrl: './recipe-details.component.css'
})
export class RecipeDetailsComponent implements OnInit {
  meal: any = null;
  servings = 1;  // default 1 serving مش 2
  isLoading = false;
  addedToLog = false;

  constructor(
    private router: Router,
    private apiService: ApiService,
    private caloriesService: CaloriesService
  ) {}

  ngOnInit() {
    // history.state أكثر موثوقية من router.getCurrentNavigation()
    const state = history.state as { meal: any };
    if (state?.meal) {
      this.meal = state.meal;
    } else {
      this.router.navigate(['/recipes']);
    }
  }

  increase() { this.servings++; }
  decrease() { if (this.servings > 1) this.servings--; }

  logMeal() {
    if (!this.meal?.id) return;
    this.isLoading = true;

    const payload = {
      mealId: this.meal.id,
      servings: this.servings
    };

    this.apiService.recordMeal(payload).subscribe({
      next: (res: any) => {
        this.addedToLog = true;
        this.isLoading = false;
        // CaloriesService بيحدث الـ localStorage تلقائياً
        const caloriesEaten = (this.meal.calories || 0) * this.servings;
        this.caloriesService.addFood(caloriesEaten);
      },
      error: (err: any) => {
        console.error('Log meal error:', err);
        this.isLoading = false;
      }
    });
  }

  goBack() { this.router.navigate(['/recipes']); }

  isString(val: any): boolean { return typeof val === 'string'; }

  splitIngredients(val: string): string[] {
    // بيقسم على ; أو , أو newline
    return val.split(/[;\n]/).map(s => s.trim()).filter(s => s.length > 0);
  }

  getImageUrl(): string {
    if (this.meal?.imageUrl && this.meal.imageUrl.startsWith('http')) return this.meal.imageUrl;
    return 'assets/images/brg.jpg';
  }

  get scaledCalories(): number {
    return Math.round((this.meal?.calories || 0) * this.servings);
  }
}

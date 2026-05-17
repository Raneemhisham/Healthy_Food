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
  servings = 1;
  isLoading = false;
  addedToLog = false;

  constructor(
    private router: Router,
    private apiService: ApiService,
    private caloriesService: CaloriesService
  ) {}

  ngOnInit() {
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

    // Backend only accepts mealId (servings not in DTO)
    this.apiService.recordMeal({ mealId: this.meal.id }).subscribe({
      next: (res: any) => {
        this.addedToLog = true;
        this.isLoading = false;
        // Update calories locally with servings multiplier
        const caloriesEaten = (this.meal.calories || 0) * this.servings;
        this.caloriesService.addFood(caloriesEaten);
        // Update displayed food from API response if available
        if (res?.data?.consumedCalories) {
          this.caloriesService.setFood(res.data.consumedCalories);
        }
      },
      error: () => { this.isLoading = false; }
    });
  }

  goBack() { this.router.navigate(['/recipes']); }

  getIngredientsList(): string[] {
    if (!this.meal?.ingredients) return [];
    if (typeof this.meal.ingredients === 'string') {
      return this.meal.ingredients
        .split(/[;\n]/)
        .map((s: string) => s.trim())
        .filter((s: string) => s.length > 0);
    }
    return this.meal.ingredients;
  }

  getStepsList(): string[] {
    if (!this.meal?.preparationMethod) return [];
    return this.meal.preparationMethod
      .split(/(?<=[.!?])\s+|\n/)
      .map((s: string) => s.trim())
      .filter((s: string) => s.length > 2);
  }

  getImageUrl(): string {
    if (this.meal?.imageUrl?.startsWith('http')) return this.meal.imageUrl;
    return 'assets/images/brg.jpg';
  }

  get scaledCalories(): number {
    return Math.round((this.meal?.calories || 0) * this.servings);
  }
}

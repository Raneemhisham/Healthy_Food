import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../shared/services/api.service';

@Component({
  selector: 'app-recipes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './recipes.component.html',
  styleUrl: './recipes.component.css'
})
export class RecipesComponent implements OnInit {
  meals: any[] = [];
  filteredMeals: any[] = [];
  searchQuery = '';
  isLoading = true;
  diseaseName = '';

  constructor(private apiService: ApiService, private router: Router) {}

  ngOnInit() {
    this.diseaseName = localStorage.getItem('userDiseaseName') || '';
    this.loadMeals();
  }

  loadMeals() {
    this.isLoading = true;
    this.apiService.getMeals().subscribe({
      next: (res) => {
        const all = res.data || (Array.isArray(res) ? res : []);
        // deduplicate by id
        const seen = new Set();
        this.meals = all.filter((m: any) => {
          if (seen.has(m.id)) return false;
          seen.add(m.id);
          return true;
        });
        this.filteredMeals = [...this.meals];
        this.isLoading = false;
      },
      error: () => { this.isLoading = false; }
    });
  }

  onSearch() {
    const q = this.searchQuery.toLowerCase();
    this.filteredMeals = this.meals.filter(m =>
      m.name?.toLowerCase().includes(q) ||
      m.category?.toLowerCase().includes(q) ||
      m.description?.toLowerCase().includes(q)
    );
  }

  openMeal(meal: any) {
    this.router.navigate(['/recipe-details'], { state: { meal } });
  }

  getImageUrl(meal: any): string {
    if (meal.imageUrl && meal.imageUrl.startsWith('http')) return meal.imageUrl;
    return 'assets/images/35913c2a-3cd4-4c2a-8649-6100518ec473.png';
  }
}

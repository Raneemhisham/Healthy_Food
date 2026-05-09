import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../shared/services/api.service';
import { AuthService } from '../../shared/services/auth.service';

@Component({
  selector: 'app-resturant',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './resturant.component.html',
  styleUrl: './resturant.component.css'
})
export class ResturantComponent implements OnInit {
  restaurants: any[] = [];
  filteredRestaurants: any[] = [];
  searchQuery = '';
  isLoading = true;

  selectedRestaurant: any = null;
  isModalOpen = false;
  reviewRating = 5;
  reviewComment = '';
  isSubmitting = false;
  reviewSuccess = '';
  reviewError = '';
  diseaseName = '';

  constructor(private apiService: ApiService, private authService: AuthService, private router: Router) {}

  ngOnInit() {
    this.diseaseName = localStorage.getItem('userDiseaseName') || '';
    this.loadRestaurants();
  }

  loadRestaurants() {
    this.isLoading = true;
    this.apiService.getRestaurants().subscribe({
      next: (res) => {
        const all = res.data || (Array.isArray(res) ? res : []);
        // deduplicate by name + branch (مش بالـ id عشان الـ seeding بيضيف نفس المطعم بـ IDs مختلفة)
        const seen = new Set<string>();
        this.restaurants = all.filter((r: any) => {
          const key = `${r.name}-${r.branch}-${r.city}`;
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        });
        this.filteredRestaurants = [...this.restaurants];
        this.isLoading = false;
      },
      error: () => { this.isLoading = false; }
    });
  }

  onSearch() {
    const q = this.searchQuery.toLowerCase();
    this.filteredRestaurants = this.restaurants.filter(r =>
      r.name?.toLowerCase().includes(q) ||
      r.category?.toLowerCase().includes(q) ||
      r.location?.toLowerCase().includes(q)
    );
  }

  openDetails(restaurant: any) {
    this.router.navigate(['/resturant-details'], { state: { restaurant } });
  }

  openReviewModal(restaurant: any) {
    this.selectedRestaurant = restaurant;
    this.reviewRating = 5;
    this.reviewComment = '';
    this.reviewSuccess = '';
    this.reviewError = '';
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
    this.selectedRestaurant = null;
  }

  submitReview() {
    if (!this.reviewComment.trim()) return;
    this.isSubmitting = true;
    this.apiService.addRestaurantReview(this.selectedRestaurant.id, {
      rating: this.reviewRating,
      comment: this.reviewComment
    }).subscribe({
      next: () => {
        this.reviewSuccess = 'Review submitted!';
        this.isSubmitting = false;
        setTimeout(() => this.closeModal(), 1500);
      },
      error: (err) => {
        this.reviewError = err.error?.message || 'Failed to submit.';
        this.isSubmitting = false;
      }
    });
  }

  getStarsArray(rating: number): number[] {
    return Array(5).fill(0).map((_, i) => i);
  }

  getImageUrl(r: any): string {
    if (r.imageUrl && r.imageUrl.startsWith('http')) return r.imageUrl;
    return 'assets/images/download.jpg';
  }
}

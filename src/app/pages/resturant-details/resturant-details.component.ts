import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../shared/services/api.service';

@Component({
  selector: 'app-resturant-details',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './resturant-details.component.html',
  styleUrl: './resturant-details.component.css'
})
export class ResturantDetailsComponent implements OnInit {
  restaurant: any = null;
  reviews: any[] = [];
  isLoading = true;

  showReviewForm = false;
  reviewRating = 5;
  reviewComment = '';
  isSubmitting = false;
  reviewSuccess = '';
  reviewError = '';

  constructor(private router: Router, private apiService: ApiService) {}

  ngOnInit() {
    const state = history.state as { restaurant: any };
    if (state?.restaurant) {
      this.restaurant = state.restaurant;
      // الـ reviews موجودة في الـ restaurant object نفسه
      this.reviews = this.restaurant.reviews || [];
      this.isLoading = false;
    } else {
      this.router.navigate(['/resturant']);
    }
  }

  submitReview() {
    if (!this.reviewComment.trim()) return;
    this.isSubmitting = true;
    this.reviewSuccess = '';
    this.reviewError = '';

    this.apiService.addRestaurantReview(this.restaurant.id, {
      rating: this.reviewRating,
      comment: this.reviewComment
    }).subscribe({
      next: () => {
        // أضف الـ review محلياً
        this.reviews = [{
          rating: this.reviewRating,
          comment: this.reviewComment,
          createdAt: new Date().toISOString(),
          userName: 'You'
        }, ...this.reviews];
        this.reviewSuccess = 'Review submitted!';
        this.isSubmitting = false;
        this.reviewComment = '';
        this.reviewRating = 5;
        this.showReviewForm = false;
      },
      error: (err: any) => {
        this.reviewError = err.error?.message || 'Failed to submit.';
        this.isSubmitting = false;
      }
    });
  }

  goBack() { this.router.navigate(['/resturant']); }

  getImageUrl(): string {
    return 'assets/images/download.jpg';
  }

  getStars(rating: number): boolean[] {
    return Array(5).fill(false).map((_, i) => i < Math.round(rating || 0));
  }

  get averageRating(): number {
    if (!this.reviews.length) return this.restaurant?.averageRating || 0;
    return this.reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / this.reviews.length;
  }

  openMaps() {
    if (this.restaurant?.googleMapsLink) {
      window.open(this.restaurant.googleMapsLink, '_blank');
    }
  }
}

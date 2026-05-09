import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environment/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // ========== Meals ==========
  // GET /api/v1/meals/for-me  → وجبات مناسبة لمرض اليوزر
  getMeals(): Observable<any> {
    return this.http.get(`${this.baseUrl}/meals/for-me`);
  }

  getMealById(id: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/meals/${id}`);
  }

  // POST /api/v1/calories/me/recipes/add
  recordMeal(data: { mealId: string; servings?: number }): Observable<any> {
    return this.http.post(`${this.baseUrl}/calories/me/recipes/add`, data);
  }

  // ========== Calories ==========
  // GET /api/v1/calories/me/summary
  getDailyCalories(): Observable<any> {
    return this.http.get(`${this.baseUrl}/calories/me/summary`);
  }

  // POST /api/v1/calories/me/add  (custom food entry)
  addCalories(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/calories/me/add`, data);
  }

  // ========== Restaurants ==========
  getRestaurants(): Observable<any> {
    return this.http.get(`${this.baseUrl}/restaurants`);
  }

  getRestaurantById(id: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/restaurants/${id}`);
  }

  // POST /api/v1/restaurants/{id}/reviews/me
  addRestaurantReview(restaurantId: string, data: { rating: number; comment: string }): Observable<any> {
    return this.http.post(`${this.baseUrl}/restaurants/${restaurantId}/reviews/me`, data);
  }

  getRestaurantReviews(restaurantId: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/restaurants/${restaurantId}/reviews`);
  }

  // ========== Diseases ==========
  getDiseases(): Observable<any> {
    return this.http.get(`${this.baseUrl}/disease-registry/diseases`);
  }

  getUserDiseases(userId: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/disease-registry/user/${userId}/diseases`);
  }

  // ========== Weight ==========
  // POST /api/v1/weight-dynamics/estimate
  estimateWeight(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/weight-dynamics/estimate`, data);
  }
}

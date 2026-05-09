import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class CaloriesService {
  private foodCalories$ = new BehaviorSubject<number>(this.getInitialFood());
  foodCalories = this.foodCalories$.asObservable();

  private getInitialFood(): number {
    try {
      const stored = localStorage.getItem('todayCalories');
      if (!stored) return 0;
      const data = JSON.parse(stored);
      // لو اليوم اتغير، صفّر الـ food
      const today = new Date().toDateString();
      if (data.date !== today) {
        const reset = { ...data, food: 0, exercise: 0, date: today };
        localStorage.setItem('todayCalories', JSON.stringify(reset));
        return 0;
      }
      return data.food || 0;
    } catch { return 0; }
  }

  addFood(calories: number) {
    const current = this.foodCalories$.getValue();
    const next = current + calories;
    this.foodCalories$.next(next);
    try {
      const stored = localStorage.getItem('todayCalories');
      const today = stored ? JSON.parse(stored) : { food: 0, exercise: 0, goal: 0 };
      today.food = next;
      today.date = new Date().toDateString();
      localStorage.setItem('todayCalories', JSON.stringify(today));
    } catch {}
  }

  setFood(calories: number) {
    this.foodCalories$.next(calories);
    // حدّث الـ date عشان الـ reset اليومي يشتغل
    try {
      const stored = localStorage.getItem('todayCalories');
      const today = stored ? JSON.parse(stored) : { food: 0, exercise: 0, goal: 0 };
      today.date = new Date().toDateString();
      localStorage.setItem('todayCalories', JSON.stringify(today));
    } catch {}
  }

  resetFood() {
    this.foodCalories$.next(0);
    try {
      const stored = localStorage.getItem('todayCalories');
      const today = stored ? JSON.parse(stored) : { food: 0, exercise: 0, goal: 0 };
      today.food = 0;
      today.date = new Date().toDateString();
      localStorage.setItem('todayCalories', JSON.stringify(today));
    } catch {}
  }
}

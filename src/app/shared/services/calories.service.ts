import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class CaloriesService {
  private foodCalories$ = new BehaviorSubject<number>(this.getInitialFood());
  foodCalories = this.foodCalories$.asObservable();

  private getKey(): string {
    const userId = localStorage.getItem('userId') || 'guest';
    return `todayCalories_${userId}`;
  }

  private getInitialFood(): number {
    try {
      const key = `todayCalories_${localStorage.getItem('userId') || 'guest'}`;
      const stored = localStorage.getItem(key);
      if (!stored) return 0;
      const data = JSON.parse(stored);
      const today = new Date().toDateString();
      if (data.date !== today) {
        localStorage.setItem(key, JSON.stringify({ ...data, food: 0, exercise: 0, date: today }));
        return 0;
      }
      return data.food || 0;
    } catch { return 0; }
  }

  getStoredFood(): number {
    try {
      const stored = localStorage.getItem(this.getKey());
      if (!stored) return 0;
      const data = JSON.parse(stored);
      return data.date === new Date().toDateString() ? (data.food || 0) : 0;
    } catch { return 0; }
  }

  reloadForUser() {
    this.foodCalories$.next(this.getInitialFood());
  }

  addFood(calories: number) {
    const current = this.foodCalories$.getValue();
    const next = current + calories;
    this.foodCalories$.next(next);
    try {
      const key = this.getKey();
      const stored = localStorage.getItem(key);
      const today = stored ? JSON.parse(stored) : { food: 0, exercise: 0, goal: 0 };
      today.food = next;
      today.date = new Date().toDateString();
      localStorage.setItem(key, JSON.stringify(today));
    } catch {}
  }

  setFood(calories: number) {
    this.foodCalories$.next(calories);
    try {
      const key = this.getKey();
      const stored = localStorage.getItem(key);
      const today = stored ? JSON.parse(stored) : { food: 0, exercise: 0, goal: 0 };
      today.food = calories;
      today.date = new Date().toDateString();
      localStorage.setItem(key, JSON.stringify(today));
    } catch {}
  }

  resetFood() {
    this.foodCalories$.next(0);
    try {
      const key = this.getKey();
      const stored = localStorage.getItem(key);
      const today = stored ? JSON.parse(stored) : { food: 0, exercise: 0, goal: 0 };
      today.food = 0;
      today.date = new Date().toDateString();
      localStorage.setItem(key, JSON.stringify(today));
    } catch {}
  }
}
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-recipe-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './recipe-details.component.html',
  styleUrl: './recipe-details.component.css'
})
export class RecipeDetailsComponent {
   servings = 2;

  increase() {
    this.servings++;
  }

  decrease() {
    if (this.servings > 1) this.servings--;
  }
}

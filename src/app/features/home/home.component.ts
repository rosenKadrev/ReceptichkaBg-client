import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { RecipeStore } from '../../store/recipe.store';
import { MatButton } from '@angular/material/button';
import { MatCard, MatCardHeader, MatCardImage, MatCardTitle } from '@angular/material/card';
import { MatSpinner } from '@angular/material/progress-spinner';
import { MatTooltip } from '@angular/material/tooltip';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatButton,
    MatCard,
    MatCardHeader,
    MatCardTitle,
    MatCardImage,
    MatSpinner,
    MatTooltip
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  readonly recipeStore = inject(RecipeStore);
  readonly foodEmojis = ['🧁', '🎂', '🍰', '🍩', '🍪', '🥐', '🥮', '🥞', '🍕', '🍔', '🌮', '🌯', '🍜', '🍝', '🍣', '🍛', '🥗', '🍲', '🍗', '🍳', '🥟', '🫓'];

  leftDecor: string[] = [];
  rightDecor: string[] = [];

  ngOnInit(): void {
    this.leftDecor = this.createRandomDecor(3);
    this.rightDecor = this.createRandomDecor(3);
    this.recipeStore.getRandomRecipes(3);
  }

  private createRandomDecor(count: number): string[] {
    const pool = [...this.foodEmojis].sort(() => Math.random() - 0.5);

    if (pool.length >= count) {
      return pool.slice(0, count);
    }

    return Array.from({ length: count }, (_, idx) => this.foodEmojis[idx % this.foodEmojis.length]);
  }
}

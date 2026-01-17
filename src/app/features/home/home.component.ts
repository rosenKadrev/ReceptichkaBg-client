import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { RecipeStore } from '../../store/recipe.store';
import { MatButton } from '@angular/material/button';
import { MatCard, MatCardHeader, MatCardImage, MatCardTitle } from '@angular/material/card';
import { Recipe } from '../../store/models/data.models';
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

  ngOnInit(): void {
    this.recipeStore.getRandomRecipes(3);
  }
}

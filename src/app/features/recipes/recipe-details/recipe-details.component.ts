// recipe-details.component.ts
import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { RecipeStore } from '../../../store/recipe.store';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { StarRatingComponent } from '../../rating/star-rating/star-rating.component';
import { DisplayRatingComponent } from '../../rating/display-rating/display-rating.component';
import { UserStore } from '../../../store/user.store';

@Component({
  selector: 'app-recipe-details',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIcon,
    MatButtonModule,
    MatDividerModule,
    MatChipsModule,
    RouterModule,
    MatProgressSpinnerModule,
    StarRatingComponent,
    DisplayRatingComponent
  ],
  templateUrl: './recipe-details.component.html',
  styleUrls: ['./recipe-details.component.scss'],
})
export class RecipeDetailsComponent {
  private route = inject(ActivatedRoute);
  public recipeStore = inject(RecipeStore);
  public userStore = inject(UserStore);
  private router = inject(Router);
  public segment = signal<string>('');
  totalCookingTime = computed(() => {
    const recipe = this.recipeStore.selectedRecipe();
    return (recipe?.prepTime || 0) + (recipe?.cookTime || 0);
  });

  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      const urlSegments = this.router.url.split('/');
      this.segment.set(urlSegments[urlSegments.length - 2]);
      const id = params.get('id');
      if (id && this.segment()) {
        this.recipeStore.loadRecipeDetails({ id, segment: this.segment() })
      }
    });
  }

  ngOnDestroy() {
    this.recipeStore.clearSelectedRecipe();
  }

  onRatingSubmit(rating: number): void {
    const recipeId = this.recipeStore.selectedRecipe()?.id;
    if (recipeId) {
      this.recipeStore.rateRecipe({ recipeId, rating });
    }
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'pending':
        return 'В изчакване';
      case 'active':
        return 'Активна';
      case 'rejected':
        return 'Отхвърлена';
      default:
        return status;
    }
  }
}

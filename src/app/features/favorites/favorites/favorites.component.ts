import { Component, effect, HostListener, inject, signal } from '@angular/core';
import { FavoriteStore } from '../../../store/favorite.store';
import { FavoritesParams } from '../../../store/models/data.models';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIcon } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { RecipeStore } from '../../../store/recipe.store';
import { Router } from '@angular/router';
import { DisplayRatingComponent } from '../../rating/display-rating/display-rating.component';

@Component({
    selector: 'app-favorite-button',
    standalone: true,
    imports: [
        CommonModule,
        MatCardModule,
        MatProgressSpinner,
        MatChipsModule,
        MatIcon,
        MatButtonModule,
        DisplayRatingComponent
    ],
    templateUrl: './favorites.component.html',
    styleUrls: ['./favorites.component.scss']
})
export class FavoritesComponent {
    public favoriteStore = inject(FavoriteStore);
    public recipeStore = inject(RecipeStore);
    private router = inject(Router);
    public previousParams: FavoritesParams | null = null;
    private isLoadingMore = signal(false);
    private hasMoreRecipes = signal(true);

    constructor() {
        effect(() => {
            const currentParams = this.favoriteStore.params();
            if ((JSON.stringify(this.previousParams) !== JSON.stringify(currentParams))) {
                this.previousParams = currentParams;
                this.favoriteStore.loadFavoriteRecipes(currentParams);
            }
        });
    }

    viewRecipe(recipeId: string): void {
        this.router.navigate(['/recipes/all', recipeId]);
    }

    toggleFavorite(recipeId: string, event: Event): void {
        event.stopPropagation();
        this.favoriteStore.toggleFavorite(recipeId);
    }
}
import { Component, computed, inject, input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FavoriteStore } from '../../../store/favorite.store';

@Component({
    selector: 'app-favorite-button',
    standalone: true,
    imports: [
        MatButtonModule,
        MatIconModule,
        MatTooltipModule
    ],
    templateUrl: './favorite-btn.component.html',
    styleUrls: ['./favorite-btn.component.scss']
})
export class FavoriteButtonComponent {
    public recipeId = input.required<string>();
    public favoriteStore = inject(FavoriteStore);

    public isFavorite = computed(() =>
        this.favoriteStore.favoriteRecipeIds().includes(this.recipeId())
    );

    public tooltipText = computed(() =>
        this.isFavorite() ? 'Премахни от любими' : 'Добави в любими'
    );

    onToggle(): void {
        this.favoriteStore.toggleFavorite(this.recipeId());
    }
}
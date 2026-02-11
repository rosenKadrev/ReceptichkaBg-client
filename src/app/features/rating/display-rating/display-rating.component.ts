import { CommonModule } from '@angular/common';
import { Component, computed, input } from '@angular/core';
import { MatIcon } from '@angular/material/icon';

@Component({
    selector: 'app-display-rating',
    templateUrl: './display-rating.component.html',
    styleUrls: ['./display-rating.component.scss'],
    standalone: true,
    imports: [
        CommonModule,
        MatIcon
    ],
})
export class DisplayRatingComponent {
    public averageRating = input<number>(0);
    public ratingCount = input<number>(1);
    public showCount = input<boolean>(true);
    public size = input<string>('medium');
    public fullStars = computed(() => Math.floor(this.averageRating()));
    public hasHalfStar = computed(() => this.averageRating() % 1 >= 0.5);
    public emptyStars = computed(() => 5 - Math.ceil(this.averageRating()));
    public iconSize = computed(() => {
        const sizes: { [key: string]: string } = {
            'small': '16px',
            'medium': '20px',
            'large': '24px'
        };
        return sizes[this.size()] || sizes['medium'];
    });
}
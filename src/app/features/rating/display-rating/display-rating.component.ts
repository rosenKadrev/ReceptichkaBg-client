import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';
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

    get fullStars(): number {
        return Math.floor(this.averageRating());
    }

    get hasHalfStar(): boolean {
        return this.averageRating() % 1 >= 0.5;
    }

    get emptyStars(): number {
        return 5 - Math.ceil(this.averageRating());
    }

    getIconSize(): string {
        const sizes: { [key: string]: string } = {
            'small': '16px',
            'medium': '20px',
            'large': '24px'
        };
        return sizes[this.size()] || sizes['medium'];
    }
}
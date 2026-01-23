import { CommonModule } from '@angular/common';
import { Component, input, output, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';

@Component({
    selector: 'app-star-rating',
    standalone: true,
    templateUrl: './star-rating.component.html',
    styleUrls: ['./star-rating.component.scss'],
    imports: [
        CommonModule,
        MatIcon,
        MatButtonModule
    ],
})
export class StarRatingComponent {
    public rating = input<number>(0);
    public readonly = input<boolean>(false);
    public size = input<string>('medium');
    public ratingChange = output<number>();

    public hoverRating = signal<number>(0);

    public stars = signal<number[]>([1, 2, 3, 4, 5]);

    onStarClick(star: number): void {
        if (!this.readonly()) {
            this.ratingChange.emit(star);
        }
    }

    onStarHover(star: number): void {
        if (!this.readonly()) {
            this.hoverRating.set(star);
        }
    }

    onMouseLeave(): void {
        this.hoverRating.set(0);
    }

    getStarIcon(star: number): string {
        const currentRating = this.hoverRating() || this.rating();

        if (currentRating >= star) {
            return 'star';
        } else if (currentRating >= star - 0.5) {
            return 'star_half';
        } else {
            return 'star_border';
        }
    }

    getIconSize(): string {
        const sizes: { [key: string]: string } = {
            'small': '18px',
            'medium': '24px',
            'large': '32px'
        };
        return sizes[this.size()] || sizes['medium'];
    }
}
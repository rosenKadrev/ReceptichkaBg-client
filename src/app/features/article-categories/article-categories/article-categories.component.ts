import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSpinner } from '@angular/material/progress-spinner';
import { ArticleStore } from '../../../store/article.store';
import {
  MatCard,
  MatCardContent
} from '@angular/material/card';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-articles',
  standalone: true,
  imports: [
    CommonModule,
    MatSpinner,
    RouterLink,
    MatCard,
    MatCardContent,
  ],
  templateUrl: './article-categories.component.html',
  styleUrls: ['./article-categories.component.scss'],
})
export class ArticleCategoriesComponent {
  public articleStore = inject(ArticleStore);

  ngOnInit(): void {
    this.articleStore.getArticleCategories();
  }

  ngOnDestroy(): void {
    this.articleStore.clearSelectedCategories();
  }

}

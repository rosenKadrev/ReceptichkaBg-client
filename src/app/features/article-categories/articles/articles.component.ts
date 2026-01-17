import { Component, OnInit, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSpinner } from '@angular/material/progress-spinner';
import { ArticleStore } from '../../../store/article.store';
import { ActivatedRoute, RouterLink } from '@angular/router';
import {
  MatCard,
  MatCardContent,
  MatCardHeader,
  MatCardSubtitle,
  MatCardTitle,
} from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { ArticleParams } from '../../../store/models/data.models';
import { MatTooltip } from '@angular/material/tooltip';

@Component({
  selector: 'app-articles',
  standalone: true,
  imports: [
    CommonModule,
    MatSpinner,
    MatCard,
    RouterLink,
    MatCardHeader,
    MatCardContent,
    MatCardTitle,
    MatCardSubtitle,
    MatIcon,
    MatPaginator,
    MatTooltip
  ],
  templateUrl: './articles.component.html',
  styleUrls: ['./articles.component.scss'],
})
export class ArticlesComponent {
  public articleStore = inject(ArticleStore);
  private route = inject(ActivatedRoute);
  private previousParams: ArticleParams | null = null;

  constructor() {
    effect(() => {
      const currentParams = this.articleStore.params();
      if (JSON.stringify(this.previousParams) !== JSON.stringify(currentParams)) {
        this.previousParams = currentParams;
        this.route.paramMap.subscribe((params) => {
          const categoryId = params.get('categoryId');
          if (categoryId) {
            this.articleStore.getArticlesByCategory(categoryId);
          }
        });
      }
    });
  }

  onPageChange(event: PageEvent): void {
    this.articleStore.setParams({
      ...this.articleStore.params(),
      currentPage: event.pageIndex + 1,
      pageSize: event.pageSize,
    });
  }

  ngOnDestroy(): void {
    this.articleStore.clearSelectedArticleCategory();
    this.articleStore.clearSelectedArticles();
  }

}

import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSpinner } from '@angular/material/progress-spinner';
import { ArticleStore } from '../../../store/article.store';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCard, MatCardActions, MatCardContent, MatCardHeader, MatCardSubtitle, MatCardTitle } from '@angular/material/card';
import { UserStore } from '../../../store/user.store';
import { MatIcon } from '@angular/material/icon';
import { MatButton } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../recipes/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-articles',
  standalone: true,
  imports: [
    CommonModule,
    MatSpinner,
    MatCard,
    MatCardContent,
    MatCardHeader,
    MatCardTitle,
    MatCardSubtitle,
    MatIcon,
    MatCardActions,
    MatButton
  ],
  templateUrl: './article-details.component.html',
  styleUrls: ['./article-details.component.scss'],
})
export class ArticleDetailsComponent {
  public articleStore = inject(ArticleStore);
  public userStore = inject(UserStore);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private dialog = inject(MatDialog);

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const id = params.get('articleId');
      if (id) {
        this.articleStore.getArticleById(id);
      }
    });
  }

  ngOnDestroy(): void {
    this.articleStore.clearSelectedArticle();
  }

  onEditArticle(): void {
    const articleId = this.articleStore.selectedArticle()?.id;
    if (articleId) {
      this.router.navigate([`/edit-article/${articleId}`]);
    }
  }
  async onDeleteArticle(): Promise<void> {
    const articleId = this.articleStore.selectedArticle()?.id;

    if (!articleId) {
      return;
    }

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '500px',
      data: {
        title: 'Изтриване на статия',
        message: 'Сигурни ли сте, че искате да изтриете тази статия? Това действие е необратимо.',
        confirmText: 'Изтрий',
        cancelText: 'Отказ',
      },
    });

    dialogRef.afterClosed().subscribe(async (result) => {
      if (result === 'true') {
        this.articleStore.deleteArticle(articleId);
      }
    });
  }
}

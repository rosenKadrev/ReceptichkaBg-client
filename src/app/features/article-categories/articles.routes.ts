import { Routes } from '@angular/router';
import { ArticleCategoriesComponent } from './article-categories/article-categories.component';
import { ArticlesComponent } from './articles/articles.component';
import { ArticleDetailsComponent } from './article-details/article-details.component';


export const ARTICLES_ROUTES: Routes = [
  {
    path: '',
    component: ArticleCategoriesComponent,
  },
  {
    path: ':categoryId',
    component: ArticlesComponent,
  },
  {
    path: ':categoryId/articles/:articleId',
    component: ArticleDetailsComponent,
  }
];
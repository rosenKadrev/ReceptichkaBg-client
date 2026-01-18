import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Article, ArticleCategory, DataResponse } from '../store/models/data.models';
import { environment } from '../../config/env';

@Injectable({
  providedIn: 'root',
})
export class ArticleService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl + '/articles';

  getCategories(): Observable<DataResponse<ArticleCategory[]>> {
    return this.http.get<DataResponse<ArticleCategory[]>>(`${this.apiUrl}/article-categories`);
  }

  getArticlesByCategory(articleParams: {
    categoryId: string;
    currentPage: number;
    pageSize: number;
  }): Observable<DataResponse<{ articles: Article[]; totalResults: number }>> {
    let params = new HttpParams()
      .set('page', articleParams.currentPage.toString())
      .set('pageSize', articleParams.pageSize.toString());

    if (articleParams.categoryId) params = params.set('categoryId', articleParams.categoryId);

    return this.http.get<DataResponse<{ articles: Article[]; totalResults: number }>>(
      `${this.apiUrl}/article-categories/${articleParams.categoryId}`
    );
  }

  getArticleById(articleId: string): Observable<DataResponse<Article>> {
    return this.http.get<DataResponse<Article>>(`${this.apiUrl}/${articleId}`);
  }

  createArticle(articleData: FormData): Observable<DataResponse<Article>> {
    return this.http.post<DataResponse<Article>>(`${this.apiUrl}/add-article`, articleData);
  }

  deleteArticle(articleId: string): Observable<DataResponse<Article>> {
    return this.http.delete<DataResponse<Article>>(`${this.apiUrl}/delete-article/${articleId}`);
  }

  updateArticle(id: string, articleData: FormData): Observable<DataResponse<Article>> {
    return this.http.post<DataResponse<Article>>(`${this.apiUrl}/${id}`, articleData);
  }
}

import { inject } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { catchError, of, pipe, switchMap, tap } from 'rxjs';
import { Article, ArticleCategory, ArticleParams } from './models/data.models';
import { HttpErrorResponse } from '@angular/common/http';
import { ToastService } from '../services/toast.service';
import { ArticleService } from '../services/article.service';
import { Router } from '@angular/router';

interface ArticleState {
  categories: ArticleCategory[];
  selectedCategory: ArticleCategory | null;
  loading: boolean;
  error: string | null;
  articles: Article[];
  selectedArticle: Article | null;
  params: {
    currentPage: number;
    pageSize: number;
    categoryId?: string;
  };
  totalResults: number;
}

const initialState: ArticleState = {
  categories: [],
  selectedCategory: null,
  loading: false,
  error: null,
  articles: [],
  selectedArticle: null,
  params: {
    currentPage: 1,
    pageSize: 10,
    categoryId: '',
  },
  totalResults: 0,
};

export const ArticleStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed(() => ({})),
  withMethods(
    (
      store,
      articleService = inject(ArticleService),
      toastService = inject(ToastService),
      router = inject(Router)
    ) => {
      const getArticleCategories = rxMethod<void>(
        pipe(
          tap(() => patchState(store, { loading: true, error: null })),
          switchMap(() =>
            articleService.getCategories().pipe(
              tap((response) => {
                patchState(store, {
                  categories: response.data,
                  loading: false
                });
              }),
              catchError((error: HttpErrorResponse) => {
                const errorMessage = error.error?.message;
                patchState(store, {
                  error: errorMessage,
                  categories: [],
                  loading: false
                });
                toastService.showError(errorMessage);
                return of(null);
              })
            )
          )
        )
      );

      const getArticlesByCategory = rxMethod<string>(
        pipe(
          tap(() => patchState(store, { loading: true, error: null })),
          switchMap((categoryId) =>
            articleService.getArticlesByCategory({
              categoryId,
              currentPage: store.params().currentPage,
              pageSize: store.params().pageSize,
            }).pipe(
              tap((response) => {
                patchState(store, {
                  articles: response.data.articles,
                  selectedCategory: response.data.articles[0]?.articleCategory,
                  totalResults: response.data.totalResults,
                  loading: false
                });
              }),
              catchError((error: HttpErrorResponse) => {
                const errorMessage = error.error?.message;
                patchState(store, {
                  error: errorMessage,
                  articles: [],
                  totalResults: 0,
                  loading: false
                });
                toastService.showError(errorMessage);
                return of(null);
              })
            )
          )
        )
      );

      const getArticleById = rxMethod<string>(
        pipe(
          tap(() => patchState(store, { loading: true, error: null })),
          switchMap((articleId) =>
            articleService.getArticleById(articleId).pipe(
              tap((response) => {
                patchState(store, {
                  selectedArticle: response.data,
                  loading: false
                });
              }),
              catchError((error: HttpErrorResponse) => {
                const errorMessage = error.error?.message;
                patchState(store, {
                  error: errorMessage,
                  selectedArticle: null,
                  loading: false
                });
                toastService.showError(errorMessage);
                return of(null);
              })
            )
          )
        )
      );

      const createArticle = rxMethod<FormData>(
        pipe(
          tap(() => patchState(store, { loading: true, error: null })),
          switchMap((articleData) =>
            articleService.createArticle(articleData).pipe(
              tap((response) => {
                patchState(store, {
                  loading: false,
                  error: null
                });
                toastService.showSuccess(response.message);
                router.navigate(['/article-categories']);
              }),
              catchError((error: HttpErrorResponse) => {
                const errorMessage = error.error?.message;
                patchState(store, {
                  error: errorMessage,
                  loading: false
                });
                toastService.showError(errorMessage);
                return of(null);
              })
            )
          )
        )
      );

      const deleteArticle = rxMethod<string>(
        pipe(
          tap(() => patchState(store, { loading: true, error: null })),
          switchMap((articleId) =>
            articleService.deleteArticle(articleId).pipe(
              tap((response) => {
                patchState(store, {
                  loading: false,
                  error: null
                });
                toastService.showSuccess(response.message);
                router.navigate(['/article-categories']);
              }),
              catchError((error: HttpErrorResponse) => {
                const errorMessage = error.error?.message;
                patchState(store, {
                  error: errorMessage,
                  loading: false
                });
                toastService.showError(errorMessage);
                return of(null);
              })
            )
          )
        )
      );

      const updateArticle = rxMethod<{ id: string; articleData: FormData }>(
        pipe(
          tap(() => patchState(store, { loading: true, error: null })),
          switchMap(({ id, articleData }) =>
            articleService.updateArticle(id, articleData).pipe(
              tap((response) => {
                patchState(store, {
                  loading: false,
                  error: null
                });
                toastService.showSuccess(response.message);
                router.navigate(['/article-categories']);
              }),
              catchError((error: HttpErrorResponse) => {
                const errorMessage = error.error?.message;
                patchState(store, {
                  error: errorMessage,
                  loading: false
                });
                toastService.showError(errorMessage);
                return of(null);
              })
            )
          )
        )
      );

      const setParams = (params: ArticleParams): void => {
        patchState(store, { params: params });
      };

      const clearSelectedArticle = (): void => {
        patchState(store, { selectedArticle: null });
      };

      const clearSelectedArticleCategory = (): void => {
        patchState(store, { selectedCategory: null });
      };

      const clearSelectedArticles = (): void => {
        patchState(store, { articles: [] });
      };

      const clearSelectedCategories = (): void => {
        patchState(store, { categories: [] });
      };

      return {
        getArticleCategories,
        getArticlesByCategory,
        getArticleById,
        createArticle,
        deleteArticle,
        updateArticle,
        setParams,
        clearSelectedArticle,
        clearSelectedArticleCategory,
        clearSelectedArticles,
        clearSelectedCategories
      };
    }
  )
);
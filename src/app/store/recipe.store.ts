import { inject } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { catchError, of, pipe, switchMap, tap } from 'rxjs';
import { Recipe, RecipeFilters, RecipeLookups } from './models/data.models';
import { RecipeService } from '../services/recipe.service';
import { HttpErrorResponse } from '@angular/common/http';
import { ToastService } from '../services/toast.service';
import { Router } from '@angular/router';

interface RecipeState {
  recipes: Recipe[];
  loading: boolean;
  error: string | null;
  selectedRecipe: Recipe | null;
  lookups: RecipeLookups | null;
  params: {
    currentPage: number;
    pageSize: number;
    searchText?: string;
    searchByName?: string;
    status?: string;
    categoryId?: string;
    typeOfProcessingId?: string;
    degreeOfDifficultyId?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    createdAtFrom?: Date | null;
    createdAtTo?: Date | null;
  };
  totalResults: number;
}

const initialState: RecipeState = {
  recipes: [],
  loading: false,
  error: null,
  selectedRecipe: null,
  lookups: {
    categories: [],
    processingTypes: [],
    degreeOfDifficulty: [],
  },
  params: {
    currentPage: 1,
    pageSize: 6,
    searchText: '',
    searchByName: '',
    status: '',
    categoryId: '',
    typeOfProcessingId: '',
    degreeOfDifficultyId: '',
    sortBy: 'createdAt',
    sortOrder: 'desc',
    createdAtFrom: null,
    createdAtTo: null,
  },
  totalResults: 0
};

export const RecipeStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed(() => ({})),
  withMethods(
    (
      store,
      recipeService = inject(RecipeService),
      toastService = inject(ToastService),
      router = inject(Router)
    ) => {
      const loadRecipes = rxMethod<{ params: RecipeFilters, segment: string }>(
        pipe(
          tap((filters) =>
            patchState(store, {
              loading: true,
              error: null,
              params: filters.params,
            })
          ),
          switchMap((filters) =>
            recipeService.getRecipes(filters.params, filters.segment).pipe(
              tap((response) => {
                patchState(store, {
                  recipes: response.data.recipes,
                  params: {
                    ...store.params(),
                  },
                  totalResults: response.data.totalResults,
                  loading: false
                });
              }),
              catchError((error: HttpErrorResponse) => {
                const errorMessage = error.error?.message;
                patchState(store, {
                  error: errorMessage,
                  recipes: [],
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

      const loadLookups = rxMethod<void>(
        pipe(
          tap(() => patchState(store, { loading: true, error: null })),
          switchMap(() =>
            recipeService.getLookups().pipe(
              tap((response) => {
                patchState(store, {
                  lookups: response.data,
                  loading: false
                });
              }),
              catchError((error: HttpErrorResponse) => {
                const errorMessage = error.error?.message;
                patchState(store, {
                  error: errorMessage,
                  lookups: null,
                  loading: false
                });
                toastService.showError(errorMessage);
                return of(null);
              })
            )
          )
        )
      );

      const addRecipe = rxMethod<FormData>(
        pipe(
          tap(() => patchState(store, { loading: true, error: null })),
          switchMap((recipeData) =>
            recipeService.createRecipe(recipeData).pipe(
              tap((response) => {
                patchState(store, { loading: false });
                toastService.showSuccess(response.message);
                router.navigate(['/recipes/my']);
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

      const deleteRecipe = rxMethod<string>(
        pipe(
          tap(() => patchState(store, { loading: true, error: null })),
          switchMap((recipeId) =>
            recipeService.deleteRecipe(recipeId).pipe(
              tap((response) => {
                patchState(store, { loading: false });
                toastService.showSuccess(response.message);
                loadRecipes({ params: store.params(), segment: 'my' });
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

      const adminDeleteRecipe = rxMethod<string>(
        pipe(
          tap(() => patchState(store, { loading: true, error: null })),
          switchMap((recipeId) =>
            recipeService.adminDeleteRecipe(recipeId).pipe(
              tap((response) => {
                patchState(store, { loading: false });
                toastService.showSuccess(response.message);
                loadRecipes({ params: store.params(), segment: 'admin' });
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

      const loadRecipeDetails = rxMethod<{ id: string; segment: string }>(
        pipe(
          tap(() => patchState(store, { loading: true, error: null })),
          switchMap(({ id, segment }) => {
            const apiCall$ =
              segment === 'my'
                ? recipeService.getMyRecipeById(id, segment)
                : recipeService.getRecipeById(id, segment);
            return apiCall$.pipe(
              tap((response) => {
                patchState(store, {
                  selectedRecipe: response.data,
                  loading: false
                });
              }),
              catchError((error: HttpErrorResponse) => {
                const errorMessage = error.error?.message;
                patchState(store, {
                  error: errorMessage,
                  selectedRecipe: null,
                  loading: false
                });
                toastService.showError(errorMessage);
                return of(null);
              })
            );
          })
        )
      );

      const updateRecipe = rxMethod<{ id: string; recipeData: FormData }>(
        pipe(
          tap(() => patchState(store, { loading: true, error: null })),
          switchMap(({ id, recipeData }) =>
            recipeService.updateRecipe(id, recipeData).pipe(
              tap((response) => {
                const updatedRecipes = store
                  .recipes()
                  .map((recipe) => (recipe.id === id ? { ...response.data, id } : recipe));
                patchState(store, {
                  recipes: updatedRecipes,
                  loading: false,
                });
                toastService.showSuccess(response.message);
                router.navigate(['/recipes/my/' + id]);
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

      const getRandomRecipes = rxMethod<number>(
        pipe(
          tap(() => patchState(store, { loading: true, error: null })),
          switchMap((count) =>
            recipeService.getRandomRecipes(count).pipe(
              tap((response) => {
                patchState(store, {
                  recipes: response.data,
                  loading: false
                });
              }),
              catchError((error: HttpErrorResponse) => {
                const errorMessage = error.error?.message;
                patchState(store, {
                  error: errorMessage,
                  recipes: [],
                  loading: false
                });
                toastService.showError(errorMessage);
                return of(null);
              })
            )
          )
        )
      );

      const approveRecipe = rxMethod<string>(
        pipe(
          tap(() => patchState(store, { loading: true, error: null })),
          switchMap((id) =>
            recipeService.approveRecipe(id).pipe(
              tap((response) => {
                patchState(store, { loading: false });
                toastService.showSuccess(response.message);
                loadRecipes({ params: { ...store.params(), pageSize: 10 }, segment: 'admin' });
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

      const rejectRecipe = rxMethod<string>(
        pipe(
          tap(() => patchState(store, { loading: true, error: null })),
          switchMap((id) =>
            recipeService.rejectRecipe(id).pipe(
              tap((response) => {
                patchState(store, { loading: false });
                toastService.showSuccess(response.message);
                loadRecipes({ params: { ...store.params(), pageSize: 10 }, segment: 'admin' });
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

      const rateRecipe = rxMethod<{ recipeId: string; rating: number }>(
        pipe(
          tap(() => patchState(store, { loading: true, error: null })),
          switchMap(({ recipeId, rating }) =>
            recipeService.rateRecipe(recipeId, rating).pipe(
              tap((response) => {
                const updatedRecipe = store.selectedRecipe();
                if (updatedRecipe) {
                  patchState(store, {
                    selectedRecipe: {
                      ...updatedRecipe,
                      rating: response.data
                    },
                    loading: false,
                  });
                }
                toastService.showSuccess(response.message);
              }),
              catchError((error: HttpErrorResponse) => {
                const errorMessage = error.error?.message;
                patchState(store, {
                  error: errorMessage,
                  loading: false,
                });
                toastService.showError(errorMessage);
                return of(null);
              })
            )
          )
        )
      );

      const clearParams = (): void => {
        patchState(store, {
          params: {
            currentPage: 1,
            searchText: '',
            searchByName: '',
            status: '',
            categoryId: '',
            typeOfProcessingId: '',
            degreeOfDifficultyId: '',
            sortBy: 'createdAt',
            sortOrder: 'desc',
            pageSize: 6,
            createdAtFrom: null,
            createdAtTo: null,
          },
        });
      };

      const clearSelectedRecipe = (): void => {
        patchState(store, { selectedRecipe: null });
      };

      const setParams = (params: RecipeFilters): void => {
        patchState(store, { params: params });
      };

      const clearRecipes = (): void => {
        patchState(store, { recipes: [] });
      };

      const clearError = (): void => {
        patchState(store, { error: null });
      };

      return {
        loadRecipes,
        loadLookups,
        addRecipe,
        deleteRecipe,
        adminDeleteRecipe,
        loadRecipeDetails,
        updateRecipe,
        getRandomRecipes,
        approveRecipe,
        rejectRecipe,
        rateRecipe,
        clearParams,
        clearSelectedRecipe,
        setParams,
        clearRecipes,
        clearError,
      };
    }
  )
);
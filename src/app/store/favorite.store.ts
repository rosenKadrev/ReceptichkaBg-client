import { HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { catchError, of, pipe, switchMap, tap } from 'rxjs';
import { FavoriteService } from '../services/favorite.service';
import { ToastService } from '../services/toast.service';
import { FavoritesParams, Recipe } from './models/data.models';

interface FavoriteState {
    favoriteRecipeIds: string[];
    favoriteRecipes: Recipe[];
    params: FavoritesParams;
    loading: boolean;
    error: string | null;
    totalResults: number;
}

const initialState: FavoriteState = {
    favoriteRecipeIds: [],
    favoriteRecipes: [],
    params: {
        currentPage: 1,
        pageSize: 100
    },
    loading: false,
    error: null,
    totalResults: 0,
};

export const FavoriteStore = signalStore(
    { providedIn: 'root' },
    withState(initialState),
    withComputed(() => ({})),
    withMethods(
        (
            store,
            favoriteService = inject(FavoriteService),
            toastService = inject(ToastService),
        ) => {
            const loadFavorites = rxMethod<void>(
                pipe(
                    tap(() => patchState(store, { loading: true, error: null })),
                    switchMap(() =>
                        favoriteService.getUserFavorites().pipe(
                            tap((response) => {
                                patchState(store, {
                                    favoriteRecipeIds: response.data,
                                    loading: false
                                });
                            }),
                            catchError((error: HttpErrorResponse) => {
                                const errorMessage = error.error?.message || 'Грешка при зареждане на любими рецепти';
                                patchState(store, {
                                    error: errorMessage,
                                    favoriteRecipeIds: [],
                                    loading: false
                                });
                                toastService.showError(errorMessage);
                                return of(null);
                            })
                        )
                    )
                )
            );

            const addFavorite = rxMethod<string>(
                pipe(
                    tap(() => patchState(store, { loading: true, error: null })),
                    switchMap((recipeId) =>
                        favoriteService.addFavorite(recipeId).pipe(
                            tap((response) => {
                                patchState(store, {
                                    favoriteRecipeIds: [...store.favoriteRecipeIds(), recipeId],
                                    loading: false
                                });
                                toastService.showSuccess(response.message);
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

            const removeFavorite = rxMethod<string>(
                pipe(
                    tap(() => patchState(store, { loading: true, error: null })),
                    switchMap((recipeId) =>
                        favoriteService.removeFavorite(recipeId).pipe(
                            tap((response) => {
                                patchState(store, {
                                    favoriteRecipeIds: store.favoriteRecipeIds().filter(id => id !== recipeId),
                                    loading: false
                                });
                                toastService.showSuccess(response.message);
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

            const toggleFavorite = rxMethod<string>(
                pipe(
                    switchMap((recipeId) => {
                        const isFavorite = store.favoriteRecipeIds().includes(recipeId);

                        if (isFavorite) {
                            return favoriteService.removeFavorite(recipeId).pipe(
                                tap((response) => {
                                    patchState(store, {
                                        favoriteRecipeIds: store.favoriteRecipeIds().filter(id => id !== recipeId)
                                    });
                                    toastService.showSuccess(response.message || 'Рецептата е премахната от любими');

                                    if (store.favoriteRecipes().length > 0) {
                                        loadFavoriteRecipes(store.params());
                                    }
                                }),
                                catchError((error: HttpErrorResponse) => {
                                    const errorMessage = error.error?.message || 'Грешка при премахване от любими';
                                    patchState(store, { error: errorMessage });
                                    toastService.showError(errorMessage);
                                    return of(null);
                                })
                            );
                        } else {
                            return favoriteService.addFavorite(recipeId).pipe(
                                tap((response) => {
                                    patchState(store, {
                                        favoriteRecipeIds: [...store.favoriteRecipeIds(), recipeId]
                                    });
                                    toastService.showSuccess(response.message || 'Рецептата е добавена в любими');

                                    if (store.favoriteRecipes().length > 0) {
                                        loadFavoriteRecipes(store.params());
                                    }
                                }),
                                catchError((error: HttpErrorResponse) => {
                                    const errorMessage = error.error?.message || 'Грешка при добавяне в любими';
                                    patchState(store, { error: errorMessage });
                                    toastService.showError(errorMessage);
                                    return of(null);
                                })
                            );
                        }
                    })
                )
            );

            const loadFavoriteRecipes = rxMethod<FavoritesParams>(
                pipe(
                    tap(() => patchState(store, { loading: true, error: null })),
                    switchMap((params) =>
                        favoriteService.getFavoriteRecipes(params).pipe(
                            tap((response) => {
                                patchState(store, {
                                    favoriteRecipes: response.data.recipes,
                                    totalResults: response.data.totalResults,
                                    loading: false
                                });
                            }),
                            catchError((error: HttpErrorResponse) => {
                                const errorMessage = error.error?.message || 'Грешка при зареждане на любими рецепти';
                                patchState(store, {
                                    error: errorMessage,
                                    favoriteRecipes: [],
                                    loading: false
                                });
                                toastService.showError(errorMessage);
                                return of(null);
                            })
                        )
                    )
                )
            );

            const setParams = (params: FavoritesParams): void => {
                patchState(store, { params: params });
            };

            const clearFavorites = (): void => {
                patchState(store, { favoriteRecipeIds: [], error: null });
            };

            const clearError = (): void => {
                patchState(store, { error: null });
            };

            return {
                loadFavorites,
                addFavorite,
                removeFavorite,
                toggleFavorite,
                loadFavoriteRecipes,
                setParams,
                clearFavorites,
                clearError
            };
        }
    )
);
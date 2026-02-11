import { computed, inject } from '@angular/core';
import {
  patchState,
  signalStore,
  withComputed,
  withHooks,
  withMethods,
  withState,
} from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { catchError, of, pipe, switchMap, tap } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../services/auth.service';
import { UserService } from '../services/user.service';
import { AuthResponse, DataResponse, LoginRequest, User, UserFilters } from './models/data.models';
import { ToastService } from '../services/toast.service';
import { Router } from '@angular/router';
import { TokenExpirationService } from '../services/token-expiration.service';
import { FavoriteStore } from './favorite.store';

interface UserState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  users: User[];
  params: {
    currentPage: number;
    pageSize: number;
    name?: string;
    email?: string;
    gender?: string;
    role?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    createdAtFrom?: Date | null;
    createdAtTo?: Date | null;
  };
  totalResults: number;
}

const initialState: UserState = {
  user: null,
  token: null,
  loading: false,
  error: null,
  users: [],
  params: {
    currentPage: 1,
    pageSize: 10,
    name: '',
    email: '',
    gender: '',
    role: '',
    sortBy: 'dateCreated',
    sortOrder: 'desc',
    createdAtFrom: null,
    createdAtTo: null,
  },
  totalResults: 0
};

export const UserStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed((store) => ({
    isLoggedIn: computed(() => !!store.token()),
    isUserAdmin: computed(() => store.user()?.role === 'admin'),
    isUserSuperAdmin: computed(() => store.user()?.role === 'superAdmin')
  })),
  withMethods(
    (
      store,
      authService = inject(AuthService),
      userService = inject(UserService),
      toastService = inject(ToastService),
      favoriteStore = inject(FavoriteStore),
      router = inject(Router),
      tokenExpirationService = inject(TokenExpirationService)
    ) => {
      const login = rxMethod<LoginRequest>(
        pipe(
          tap(() => patchState(store, { loading: true, error: null })),
          switchMap((loginRequest) =>
            authService.login(loginRequest).pipe(
              tap((response: DataResponse<AuthResponse>) => {
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('user', JSON.stringify(response.data.user));
                patchState(store, {
                  user: response.data.user,
                  token: response.data.token,
                  loading: false,
                });
                toastService.showSuccess(response.message);
                tokenExpirationService.startTokenExpirationCheck(() => {
                  patchState(store, initialState);
                });
                favoriteStore.loadFavorites();
              }),
              catchError((error: HttpErrorResponse) => {
                const errorMessage = error.error?.message;
                patchState(store, {
                  error: errorMessage,
                  user: null,
                  token: null,
                  loading: false
                });
                toastService.showError(errorMessage);
                return of(null);
              })
            )
          )
        )
      );

      const signup = rxMethod<User>(
        pipe(
          tap(() => patchState(store, { loading: true, error: null })),
          switchMap((user) =>
            authService.signup(user).pipe(
              tap((response: DataResponse<AuthResponse>) => {
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('user', JSON.stringify(response.data.user));
                patchState(store, {
                  user: response.data.user,
                  token: response.data.token,
                  loading: false,
                });
                toastService.showSuccess(response.message);
                tokenExpirationService.startTokenExpirationCheck(() => {
                  patchState(store, initialState);
                });
                favoriteStore.loadFavorites();
              }),
              catchError((error: HttpErrorResponse) => {
                const errorMessage = error.error?.message;
                patchState(store, {
                  error: errorMessage,
                  user: null,
                  token: null,
                  loading: false
                });
                toastService.showError(errorMessage);
                return of(null);
              })
            )
          )
        )
      );

      const updateUser = rxMethod<FormData>(
        pipe(
          tap(() => patchState(store, { loading: true, error: null })),
          switchMap((formData) =>
            userService.updateUser(store.user()!.id, formData).pipe(
              tap((updatedUser: DataResponse<User>) => {
                localStorage.setItem('user', JSON.stringify(updatedUser.data));
                patchState(store, {
                  user: updatedUser.data,
                  loading: false
                });
                toastService.showSuccess(updatedUser.message);
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

      const getAllUsers = rxMethod<any>(
        pipe(
          tap(() => patchState(store, { loading: true, error: null })),
          switchMap((params) =>
            userService.getAllUsers(params).pipe(
              tap(response => {
                patchState(store, {
                  users: response?.data?.users,
                  totalResults: response?.data?.totalResults,
                  loading: false
                });
              }),
              catchError((error: HttpErrorResponse) => {
                const errorMessage = error.error?.message;
                patchState(store, {
                  error: errorMessage,
                  users: [],
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

      const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        patchState(store, initialState);
        tokenExpirationService.stopTokenExpirationCheck();
        favoriteStore.clearFavorites();
        toastService.showInfo('Успешно излизане от системата');
      };

      const promoteUserToAdmin = rxMethod<string>(
        pipe(
          tap(() => patchState(store, { loading: true, error: null })),
          switchMap((userId) =>
            userService.promoteUserToAdmin(userId).pipe(
              tap((response) => {
                patchState(store, { loading: false });
                toastService.showSuccess(response.message);
                getAllUsers(store.params());
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

      const demoteAdminToUser = rxMethod<string>(
        pipe(
          tap(() => patchState(store, { loading: true, error: null })),
          switchMap((userId) =>
            userService.demoteAdminToUser(userId).pipe(
              tap((response) => {
                patchState(store, { loading: false });
                toastService.showSuccess(response.message);
                getAllUsers(store.params());
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

      const adminDeleteUser = rxMethod<string>(
        pipe(
          tap(() => patchState(store, { loading: true, error: null })),
          switchMap((userId) =>
            userService.adminDeleteUser(userId).pipe(
              tap((response) => {
                patchState(store, { loading: false });
                toastService.showSuccess(response.message);
                getAllUsers(store.params());
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

      const forgotPassword = rxMethod<string>(
        pipe(
          tap(() => patchState(store, { loading: true, error: null })),
          switchMap((email) =>
            authService.forgotPassword(email).pipe(
              tap((response) => {
                patchState(store, { loading: false });
                toastService.showSuccess(response.message);
              }),
              catchError((error: HttpErrorResponse) => {
                console.log(error);
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

      const resetPassword = rxMethod<{ token: string; newPassword: string }>(
        pipe(
          tap(() => patchState(store, { loading: true, error: null })),
          switchMap((data) =>
            authService.resetPassword(data).pipe(
              tap((response) => {
                patchState(store, { loading: false });
                toastService.showSuccess(response.message);
                router.navigate(['/login']);
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

      const clearParams = (): void => {
        patchState(store, {
          params: {
            currentPage: 1,
            pageSize: 10,
            name: '',
            email: '',
            gender: '',
            role: '',
            sortBy: 'dateCreated',
            sortOrder: 'desc',
            createdAtFrom: null,
            createdAtTo: null,
          },
        });
      };

      const clearError = () => {
        patchState(store, { error: null });
      };

      const setParams = (params: UserFilters): void => {
        patchState(store, { params: params });
      };

      const clearUsers = (): void => {
        patchState(store, { users: [] });
      }

      return {
        login,
        signup,
        updateUser,
        getAllUsers,
        promoteUserToAdmin,
        demoteAdminToUser,
        adminDeleteUser,
        forgotPassword,
        resetPassword,
        logout,
        clearError,
        setParams,
        clearUsers,
        clearParams,
      };
    }
  ),
  withHooks((store, tokenExpirationService = inject(TokenExpirationService)) => ({
    onInit() {
      const token = localStorage.getItem('token');
      const user = localStorage.getItem('user');
      if (token && user) {
        patchState(store, { user: JSON.parse(user), token });
        tokenExpirationService.startTokenExpirationCheck(() => {
          patchState(store, initialState);
        });
      }
    },
  }))
);
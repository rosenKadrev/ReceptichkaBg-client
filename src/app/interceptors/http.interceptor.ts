import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { UserStore } from '../store/user.store';

export const httpErrorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const userStore = inject(UserStore);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      console.log('HTTP Error Interceptor:', error);

      if (error.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');

        userStore.logout();

        router.navigate(['/login']);
      }

      return throwError(() => error);
    })
  );
};
import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { UserStore } from '../store/user.store';

export const apiInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const userStore = inject(UserStore);

  const token = localStorage.getItem('token');
  const authedReq = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(authedReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        userStore.logout();
        router.navigate(['/login']);
      }
      return throwError(() => error);
    })
  );
};
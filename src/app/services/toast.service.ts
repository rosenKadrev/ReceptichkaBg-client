import { Injectable, inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  private snackBar = inject(MatSnackBar);

  showSuccess(message: string, duration: number = 5000) {
    this.snackBar.open(message, 'Затвори', {
      duration,
      panelClass: ['success-snackbar', 'toast-position'],
      horizontalPosition: 'end',
      verticalPosition: 'bottom',
    });
  }

  showError(message: string, duration: number = 5000) {
    this.snackBar.open(message, 'Затвори', {
      duration,
      panelClass: ['error-snackbar', 'toast-position'],
      horizontalPosition: 'end',
      verticalPosition: 'bottom',
    });
  }

  showInfo(message: string, duration: number = 5000) {
    this.snackBar.open(message, 'Затвори', {
      duration,
      panelClass: ['info-snackbar', 'toast-position'],
      horizontalPosition: 'end',
      verticalPosition: 'bottom',
    });
  }

  showWarning(message: string, duration: number = 5000) {
    this.snackBar.open(message, 'Затвори', {
      duration,
      panelClass: ['warning-snackbar', 'toast-position'],
      horizontalPosition: 'end',
      verticalPosition: 'bottom',
    });
  }
}

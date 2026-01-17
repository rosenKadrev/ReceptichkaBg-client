import { Component, inject } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogClose, MatDialogContent, MatDialogTitle } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatButton,
    MatDialogActions,
    MatDialogClose,
    MatDialogContent,
    MatDialogTitle
  ],
  template: `
    <h2 mat-dialog-title>{{ data.title }}</h2>
    <mat-dialog-content>
      <p>{{ data.message }}</p>
    </mat-dialog-content>
    <mat-dialog-actions>
      <button mat-button mat-dialog-close="false">{{ data.cancelText }}</button>
      <button mat-button color="warn" mat-dialog-close="true" cdkFocusInitial>{{ data.confirmText }}</button>
    </mat-dialog-actions>
  `,
  styles: [`
    mat-dialog-content p {
      margin: 0;
      padding: 16px 0;
    }
  `]
})
export class ConfirmDialogComponent {
    data = inject(MAT_DIALOG_DATA);
}
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatError, MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { UserStore } from '../../../store/user.store';

@Component({
    selector: 'app-forgot-password',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatDialogModule,
        MatFormField,
        MatInput,
        MatButton,
        MatIcon,
        MatError,
        MatLabel
    ],
    templateUrl: './forgot-password.component.html',
    styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent {
    private fb = inject(FormBuilder);
    private dialogRef = inject(MatDialogRef<ForgotPasswordComponent>);
    public userStore = inject(UserStore);

    forgotPasswordForm: FormGroup = this.fb.group({
        email: ['', [Validators.required, Validators.email]]
    });

    onSubmit(): void {
        if (this.forgotPasswordForm.valid) {
            const email = this.forgotPasswordForm.get('email')?.value;
            this.userStore.forgotPassword(email);

            setTimeout(() => {
                if (!this.userStore.error()) {
                    this.dialogRef.close();
                }
            }, 1000);
        }
    }

    onCancel(): void {
        this.dialogRef.close();
    }
}
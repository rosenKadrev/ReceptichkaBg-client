import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidatorFn, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { UserStore } from '../../../store/user.store';
import { MatSpinner } from '@angular/material/progress-spinner';

@Component({
    selector: 'app-password-reset',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatIconModule,
        MatCardModule,
        MatSpinner
    ],
    templateUrl: './password-reset.component.html',
    styleUrls: ['./password-reset.component.scss']
})
export class PasswordResetComponent implements OnInit {
    private fb = inject(FormBuilder);
    private route = inject(ActivatedRoute);
    private router = inject(Router);
    public userStore = inject(UserStore);

    token: string | null = null;
    hidePassword = true;
    hideConfirmPassword = true;
    tokenExpired = false;

    resetPasswordForm: FormGroup = this.fb.group({
        password: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(20)]],
        confirmPassword: ['', [Validators.required, this.passwordMatchValidator('password')]],
    }, {
        validators: this.passwordMatchValidator
    });

    ngOnInit(): void {
        this.route.queryParams.subscribe(params => {
            this.token = params['token'];

            if (!this.token) {
                this.tokenExpired = true;
            }
        });
        this.resetPasswordForm.controls['password'].valueChanges.subscribe({
            next: () => this.resetPasswordForm.controls['confirmPassword'].updateValueAndValidity()
        })
    }

    passwordMatchValidator(matchTo: string): ValidatorFn {
        return (control: AbstractControl) => {
            return control.value === control.parent?.get(matchTo)?.value ? null : { isMatching: true };
        }
    }

    onSubmit(): void {
        if (this.resetPasswordForm.valid && this.token) {
            const password = this.resetPasswordForm.get('password')?.value;

            this.userStore.resetPassword({
                token: this.token,
                newPassword: password
            });
        }
    }

    goToLogin(): void {
        this.router.navigate(['/login']);
    }
}
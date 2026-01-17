import { Component, effect, inject } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidatorFn, Validators } from '@angular/forms';
import { TextInputComponent } from '../forms/text-input/text-input.component';
import { DatePickerComponent } from '../forms/date-picker/date-picker.component';
import { SelectInputComponent } from '../forms/select-input/select-input.component';
import { MatButton } from '@angular/material/button';
import { UserStore } from '../../../store/user.store';
import { Router } from '@angular/router';
import { MatSpinner } from '@angular/material/progress-spinner';

@Component({
    standalone: true,
    imports: [
        ReactiveFormsModule,
        TextInputComponent,
        DatePickerComponent,
        SelectInputComponent,
        MatButton,
        MatSpinner
    ],
    selector: 'signup',
    templateUrl: './signup.component.html',
    styleUrls: ['./signup.component.scss']
})

export class SignupComponent {
    private fb = inject(FormBuilder);
    public userStore = inject(UserStore);
    private router = inject(Router);
    public signupForm: FormGroup = new FormGroup({});
    public maxDate = new Date();
    public minDate = new Date();
    public genderOptions = ['male', 'female'];

    constructor() {
        effect(() => {
            if (this.userStore.isLoggedIn()) {
                this.router.navigate(['/']);
            }
        });
    }

    ngOnInit(): void {
        this.initializeForm();
        this.maxDate.setFullYear(this.maxDate.getFullYear() - 18);
        this.minDate.setFullYear(this.minDate.getFullYear() - 100);
    }

    public initializeForm() {
        this.signupForm = this.fb.group({
            username: ['', [Validators.required, Validators.pattern('^[a-zA-Z ]*$')]],
            name: ['', [Validators.required]],
            email: ['', [Validators.required, Validators.email]],
            gender: ['', Validators.required],
            dateOfBirth: ['', Validators.required],
            password: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(20)]],
            confirmPassword: ['', [Validators.required, this.matchValues('password')]],
        });
        this.signupForm.controls['password'].valueChanges.subscribe({
            next: () => this.signupForm.controls['confirmPassword'].updateValueAndValidity()
        })
    }

    public matchValues(matchTo: string): ValidatorFn {
        return (control: AbstractControl) => {
            return control.value === control.parent?.get(matchTo)?.value ? null : { isMatching: true };
        }
    }

    public onSubmit() {
        if (this.signupForm.invalid) {
            return;
        }

        const dob = this.getDateOnly(this.signupForm.get('dateOfBirth')?.value);
        this.signupForm.patchValue({ dateOfBirth: dob });

        this.userStore.signup(this.signupForm.value);
    }

    private getDateOnly(dob: string | undefined) {
        if (!dob) return;
        return new Date(dob).toISOString().slice(0, 10);
    }
}

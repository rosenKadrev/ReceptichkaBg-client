import { Component, effect, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MatSpinner } from '@angular/material/progress-spinner';
import { Router, RouterModule } from '@angular/router';
import { TextInputComponent } from '../forms/text-input/text-input.component';
import { UserStore } from '../../../store/user.store';
import { MatDialog } from '@angular/material/dialog';
import { ForgotPasswordComponent } from '../forgot-password/forgot-password.component';

@Component({
  standalone: true,
  imports: [MatButton, MatSpinner, ReactiveFormsModule, RouterModule, TextInputComponent],
  selector: 'login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  private dialog = inject(MatDialog);
  private fb = inject(FormBuilder);
  public userStore = inject(UserStore);
  private router = inject(Router);
  public loginForm: FormGroup = new FormGroup({});

  constructor() {
    effect(() => {
      if (this.userStore.isLoggedIn()) {
        this.router.navigate(['/']);
      }
    });
  }

  ngOnInit(): void {
    this.initializeForm();
  }

  public initializeForm() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: [
        '',
        [Validators.required, Validators.minLength(6), Validators.maxLength(20)],
      ],
    });
  }

  public onSubmit() {
    if (this.loginForm.invalid) {
      return;
    }

    this.userStore.login(this.loginForm.value);
  }

  openForgotPasswordDialog(): void {
    this.dialog.open(ForgotPasswordComponent, {
      width: '450px',
      disableClose: false,
      autoFocus: true
    });
  }
}

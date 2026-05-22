import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild, effect, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MatSpinner } from '@angular/material/progress-spinner';
import { Router, RouterModule } from '@angular/router';
import { TextInputComponent } from '../forms/text-input/text-input.component';
import { UserStore } from '../../../store/user.store';
import { MatDialog } from '@angular/material/dialog';
import { ForgotPasswordComponent } from '../forgot-password/forgot-password.component';
import { environment } from '../../../../config/env';

@Component({
  standalone: true,
  imports: [MatButton, MatSpinner, ReactiveFormsModule, RouterModule, TextInputComponent],
  selector: 'login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements AfterViewInit, OnDestroy {
  @ViewChild('googleBtn') googleBtnRef!: ElementRef<HTMLDivElement>;

  private dialog = inject(MatDialog);
  private fb = inject(FormBuilder);
  public userStore = inject(UserStore);
  private router = inject(Router);
  public loginForm: FormGroup = new FormGroup({});
  private resizeObserver?: ResizeObserver;
  private googleSSOInitialized = false;

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

  ngAfterViewInit(): void {
    this.initializeGoogleSSO();
  }

  private initializeGoogleSSO(): void {
    if (this.googleSSOInitialized) {
      return;
    }

    if (typeof (window as any).google === 'undefined') {
      setTimeout(() => this.initializeGoogleSSO(), 100);
      return;
    }

    this.googleSSOInitialized = true;

    google.accounts.id.initialize({
      client_id: environment.googleClientId,
      callback: (response) => {
        this.userStore.googleLogin(response.credential);
      },
    });

    requestAnimationFrame(() => {
      this.renderGoogleButton();
      this.resizeObserver = new ResizeObserver(() => this.renderGoogleButton());
      this.resizeObserver.observe(this.googleBtnRef.nativeElement);
    });
  }

  ngOnDestroy(): void {
    this.resizeObserver?.disconnect();
  }

  private renderGoogleButton(): void {
    if (!this.googleBtnRef?.nativeElement) {
      return;
    }

    const width = Math.max(240, Math.floor(this.googleBtnRef.nativeElement.clientWidth));
    this.googleBtnRef.nativeElement.innerHTML = '';
    google.accounts.id.renderButton(this.googleBtnRef.nativeElement, {
      theme: 'outline',
      size: 'large',
      text: 'signin_with',
      shape: 'pill',
      width,
    });

    const roleButton = this.googleBtnRef.nativeElement.querySelector('[role="button"]') as HTMLElement | null;
    if (roleButton) {
      roleButton.style.removeProperty('width');
      roleButton.style.removeProperty('max-width');
      roleButton.style.removeProperty('min-width');
      roleButton.style.width = '100%';
      roleButton.style.maxWidth = 'none';
      roleButton.style.minWidth = '0';
      roleButton.style.height = '3rem';
    }
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

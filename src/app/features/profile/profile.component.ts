import { DatePipe } from '@angular/common';
import { Component, DestroyRef, OnDestroy, OnInit, inject, signal } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatSpinner } from '@angular/material/progress-spinner';
import { UserStore } from '../../store/user.store';
import { TextInputComponent } from '../auth/forms/text-input/text-input.component';
import { DatePickerComponent } from '../auth/forms/date-picker/date-picker.component';
import { SelectInputComponent } from '../auth/forms/select-input/select-input.component';
import { DisplayRatingComponent } from '../rating/display-rating/display-rating.component';
import { RecipeStore } from '../../store/recipe.store';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    DatePipe,
    ReactiveFormsModule,
    MatButton,
    MatIcon,
    MatSpinner,
    TextInputComponent,
    DatePickerComponent,
    SelectInputComponent,
    DisplayRatingComponent,
  ],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);
  public userStore = inject(UserStore);
  private recipeStore = inject(RecipeStore);

  profileForm!: FormGroup;
  public isOwnProfile = signal(true);

  public maxDate = new Date();
  public minDate = new Date();
  public genderOptions = ['male', 'female'];
  public avatarPreview: string | ArrayBuffer | null = null;

  ngOnInit(): void {
    this.maxDate.setFullYear(this.maxDate.getFullYear() - 18);
    this.minDate.setFullYear(this.minDate.getFullYear() - 100);

    this.route.paramMap
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((params) => {
        const routeUserId = params.get('id');

        const me = this.userStore.user();
        const routePath = this.route.snapshot.routeConfig?.path ?? '';

        const isMyRoute = routePath.startsWith('profile/my') || !routeUserId || routeUserId === me?.id;
        this.isOwnProfile.set(isMyRoute);

        if (isMyRoute) {
          this.buildForm(me);
          return;
        }

        const selected = this.userStore.selectedProfile();
        if (!selected || selected.id !== routeUserId) {
          if (routeUserId) {
            this.userStore.getUserProfileById(routeUserId);
          }
        }
      });
  }

  ngOnDestroy(): void {
    this.userStore.clearSelectedProfile();
  }

  private buildForm(user: any): void {
    this.profileForm = this.fb.group({
      username: [{ value: user?.username ?? '', disabled: true }],
      name: [{ value: user?.name ?? '', disabled: false }, Validators.required],
      email: [{ value: user?.email ?? '', disabled: false }, [Validators.required, Validators.email]],
      gender: [{ value: user?.gender ?? '', disabled: false }, Validators.required],
      dateOfBirth: [{ value: user?.dateOfBirth ?? null, disabled: false }, Validators.required],
      avatar: new FormControl<File | null>(null),
    });
  }

  onFileSelected(event: Event): void {
    if (!this.isOwnProfile()) return;

    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      this.profileForm.patchValue({ avatar: file });
      this.profileForm.get('avatar')?.updateValueAndValidity();

      const reader = new FileReader();
      reader.onload = () => (this.avatarPreview = reader.result);
      reader.readAsDataURL(file);
    }
  }

  onSubmit(): void {
    if (!this.isOwnProfile() || this.profileForm.invalid) return;

    const formData = new FormData();
    const formValues = this.profileForm.value;

    Object.keys(formValues).forEach((key) => {
      const value = formValues[key];
      if (value !== null && value !== undefined) {
        formData.append(key, key === 'dateOfBirth' ? this.getDateOnly(value) || '' : value);
      }
    });

    this.userStore.updateUser(formData);
  }

  private getDateOnly(dob: string | undefined) {
    if (!dob) return;
    return new Date(dob).toISOString().slice(0, 10);
  }

  canViewCreatorRecipes(): boolean {
    return (this.userStore.selectedProfile()?.recipesCount ?? 0) > 0;
  }

  onViewCreatorRecipes(): void {
    if (!this.canViewCreatorRecipes()) return;

    const creatorName = this.userStore.selectedProfile()?.name;
    if (!creatorName) return;

    this.recipeStore.setParams({
      ...this.recipeStore.params(),
      searchByName: creatorName,
    });
    this.router.navigate(['/recipes/all']);
  }
}
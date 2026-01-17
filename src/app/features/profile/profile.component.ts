import { Component, OnInit, inject } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatSpinner } from '@angular/material/progress-spinner';
import { UserStore } from '../../store/user.store';
import { TextInputComponent } from '../auth/forms/text-input/text-input.component';
import { DatePickerComponent } from '../auth/forms/date-picker/date-picker.component';
import { SelectInputComponent } from '../auth/forms/select-input/select-input.component';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatButton,
    MatIcon,
    MatSpinner,
    TextInputComponent,
    DatePickerComponent,
    SelectInputComponent,
  ],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent implements OnInit {
  private fb = inject(FormBuilder);
  public userStore = inject(UserStore);
  profileForm!: FormGroup;
  public maxDate = new Date();
  public minDate = new Date();
  public genderOptions = ['male', 'female'];
  public avatarPreview: string | ArrayBuffer | null = null;

  ngOnInit(): void {
    const user = this.userStore.user();
    this.profileForm = this.fb.group({
      username: [{ value: user?.username, disabled: true }],
      name: [user?.name, Validators.required],
      email: [user?.email, [Validators.required, Validators.email]],
      gender: [user?.gender, Validators.required],
      dateOfBirth: [user?.dateOfBirth, Validators.required],
      avatar: new FormControl<File | null>(null),
    });
    this.maxDate.setFullYear(this.maxDate.getFullYear() - 18);
    this.minDate.setFullYear(this.minDate.getFullYear() - 100);
  }

  onFileSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      this.profileForm.patchValue({ avatar: file });
      this.profileForm.get('avatar')?.updateValueAndValidity();

      const reader = new FileReader();
      reader.onload = () => {
        this.avatarPreview = reader.result;
      };
      reader.readAsDataURL(file);
    }
  }

  onSubmit(): void {
    if (this.profileForm.invalid) {
      return;
    }

    const formData = new FormData();
    const formValues = this.profileForm.value;

    Object.keys(formValues).forEach((key) => {
      const value = formValues[key];
      if (value !== null && value !== undefined) {
        if (key === 'dateOfBirth') {
          formData.append(key, this.getDateOnly(value) || '');
        } else {
          formData.append(key, value);
        }
      }
    });

    this.userStore.updateUser(formData);
  }

  private getDateOnly(dob: string | undefined) {
    if (!dob) return;
    return new Date(dob).toISOString().slice(0, 10);
  }
}

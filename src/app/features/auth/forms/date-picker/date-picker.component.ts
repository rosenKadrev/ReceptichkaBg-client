import { Component, input, Self } from '@angular/core';
import { ControlValueAccessor, FormControl, NgControl, ReactiveFormsModule } from '@angular/forms';
import { MatDatepicker, MatDatepickerInput, MatDatepickerToggle } from '@angular/material/datepicker';
import { MatNativeDateModule} from '@angular/material/core';
import { MatInput } from '@angular/material/input';
import { MatError, MatFormField, MatHint, MatLabel, MatSuffix } from '@angular/material/form-field';

@Component({
  selector: 'date-picker',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatNativeDateModule,
    MatInput,
    MatDatepicker,
    MatDatepickerInput,
    MatDatepickerToggle,
    MatFormField,
    MatSuffix,
    MatError,
    MatHint,
    MatLabel,
  ],
  templateUrl: './date-picker.component.html',
  styleUrl: '../forms.scss',
})
export class DatePickerComponent implements ControlValueAccessor {
  public label = input<string>('');
  public hint = input<string>('');
  public maxDate = input<Date>();
  public minDate = input<Date>();

  constructor(@Self() public ngControl: NgControl) {
    this.ngControl.valueAccessor = this;
  }

  writeValue(obj: any): void {}

  registerOnChange(fn: any): void {}

  registerOnTouched(fn: any): void {}

  get control(): FormControl {
    return this.ngControl.control as FormControl;
  }
}

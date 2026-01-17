import { Component, input, Self } from '@angular/core';
import { ControlValueAccessor, FormControl, NgControl, ReactiveFormsModule } from '@angular/forms';
import { MatError, MatFormField, MatHint, MatLabel, MatSuffix } from '@angular/material/form-field';
import { MatOption, MatSelect } from '@angular/material/select';

@Component({
    selector: 'select-input',
    standalone: true,
    imports: [
        ReactiveFormsModule,
        MatSelect,
        MatFormField,
        MatLabel,
        MatHint,
        MatError,
        MatOption,
    ],
    templateUrl: './select-input.component.html',
    styleUrl: '../forms.scss'
})

export class SelectInputComponent implements ControlValueAccessor {
    public label = input<string>('');
    public hint = input<string>('');
    public options = input<string[]>([]);

    constructor(@Self() public ngControl: NgControl) {
        this.ngControl.valueAccessor = this;
    }

    writeValue(obj: any): void {
    }

    registerOnChange(fn: any): void {
    }

    registerOnTouched(fn: any): void {
    }

    get control(): FormControl {
        return this.ngControl.control as FormControl;
    }
}
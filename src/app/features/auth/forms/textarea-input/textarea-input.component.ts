import { Component, input, Self } from '@angular/core';
import { ControlValueAccessor, FormControl, NgControl, ReactiveFormsModule } from '@angular/forms';
import { MatError, MatFormField, MatHint, MatLabel} from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';

@Component({
    selector: 'textarea-input',
    standalone: true,
    imports: [
        MatFormField,
        MatInput,
        ReactiveFormsModule,
        MatError,
        MatHint,
        MatLabel,
    ],
    templateUrl: './textarea-input.component.html',
    styleUrl: '../forms.scss'
})

export class TextareaInputComponent implements ControlValueAccessor {
    public label = input<string>('');
    public hint = input<string>('');
    public rows = input<number>(4);

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

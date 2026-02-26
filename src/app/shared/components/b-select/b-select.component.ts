import { Component, input, signal, forwardRef, ChangeDetectionStrategy } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-b-select',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="form-group">
      @if (label()) {
        <label [for]="id()">{{ label() }}</label>
      }
      <div class="input-container">
        <select
          [id]="id()"
          class="form-control"
          [disabled]="disabled()"
          (change)="onSelectChange($event)"
          [value]="value()"
        >
          @if (placeholder()) {
            <option value="" disabled selected>{{ placeholder() }}</option>
          }
          @for (option of options(); track option.value) {
            <option [value]="option.value">{{ option.label }}</option>
          }
        </select>
      </div>
    </div>
  `,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => BSelectComponent),
      multi: true,
    },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BSelectComponent implements ControlValueAccessor {
  id = input<string>('');
  label = input<string>('');
  placeholder = input<string>('');
  options = input<{ label: string; value: any }[]>([]);

  value = signal<any>('');
  disabled = signal<boolean>(false);

  onChange: any = () => {};
  onTouched: any = () => {};

  onSelectChange(event: Event) {
    const val = (event.target as HTMLSelectElement).value;
    this.value.set(val);
    this.onChange(val);
  }

  writeValue(value: any): void {
    this.value.set(value || '');
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
  }
}

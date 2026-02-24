import { Component, input, signal, forwardRef, ChangeDetectionStrategy } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-b-checkbox',
  imports: [],
  template: `
    <div class="flex items-center gap-1 mt-3.5">
      <input
        type="checkbox"
        [id]="id()"
        class="radio-input"
        [checked]="value()"
        (change)="onToggle()"
        [disabled]="disabled()"
      />
      @if (label()) {
        <label [for]="id()" class="text-sm font-normal m-0 cursor-pointer">{{ label() }}</label>
      }
    </div>
  `,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => BCheckboxComponent),
      multi: true,
    },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BCheckboxComponent implements ControlValueAccessor {
  id = input<string>('');
  label = input<string>('');

  value = signal<boolean>(false);
  disabled = signal<boolean>(false);

  onChange: any = () => {};
  onTouched: any = () => {};

  onToggle() {
    const newValue = !this.value();
    this.value.set(newValue);
    this.onChange(newValue);
    this.onTouched();
  }

  writeValue(value: any): void {
    this.value.set(!!value);
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

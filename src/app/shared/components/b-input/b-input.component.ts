import { Component, input, signal, forwardRef, ChangeDetectionStrategy } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-b-input',
  imports: [CommonModule, ReactiveFormsModule, LucideAngularModule],
  template: `
    <div class="form-group">
      @if (label()) {
        <label [for]="id()">{{ label() }}</label>
      }
      <div class="input-container">
        <input
          [id]="id()"
          [type]="inputType()"
          [placeholder]="placeholder()"
          [class]="'form-control ' + (hasError() ? 'border-red-500' : '') + ' ' + class()"
          [value]="value()"
          (input)="onInput($event)"
          (blur)="onBlur()"
          [disabled]="disabled()"
        />

        @if (icon()) {
          <lucide-angular [img]="icon()" size="20" class="my-icon stroke-gray-704" />
        }

        @if (type() === 'password') {
          <button type="button" class="cursor-pointer" (click)="togglePassword()">
            <lucide-angular
              [img]="showPassword() ? eyeIcon() : eyeOffIcon()"
              size="20"
              class="my-icon stroke-gray-704"
            />
          </button>
        }
      </div>

      @if (hasError() && errorMessage()) {
        <span class="text-red-500 text-xs mt-1 block">{{ errorMessage() }}</span>
      }
    </div>
  `,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => BInputComponent),
      multi: true,
    },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BInputComponent implements ControlValueAccessor {
  id = input<string>('');
  class = input<string>('');
  label = input<string>('');
  placeholder = input<string>('');
  type = input<'text' | 'password' | 'email'>('text');
  icon = input<any>();
  eyeIcon = input<any>();
  eyeOffIcon = input<any>();
  errorMessage = input<string | null>(null);

  value = signal<string>('');
  disabled = signal<boolean>(false);
  showPassword = signal<boolean>(false);

  hasError = input<boolean>(false);

  onChange: any = () => {};
  onTouched: any = () => {};

  inputType() {
    if (this.type() === 'password') {
      return this.showPassword() ? 'text' : 'password';
    }
    return this.type();
  }

  togglePassword() {
    this.showPassword.update((v) => !v);
  }

  onInput(event: Event) {
    const val = (event.target as HTMLInputElement).value;
    this.value.set(val);
    this.onChange(val);
  }

  onBlur() {
    this.onTouched();
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

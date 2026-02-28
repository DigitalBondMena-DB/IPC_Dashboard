import {
  Component,
  input,
  signal,
  forwardRef,
  ChangeDetectionStrategy,
  output,
  OnDestroy,
} from '@angular/core';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SelectModule } from 'primeng/select';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';

@Component({
  selector: 'app-b-select',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, SelectModule],
  template: `
    <div class="form-group">
      @if (label()) {
        <label [for]="id()">{{ label() }}</label>
      }
      <div class="input-container">
        <p-select
          [id]="id()"
          [options]="options()"
          [placeholder]="placeholder()"
          [disabled]="disabled()"
          [filter]="filter()"
          [virtualScroll]="virtualScroll()"
          [virtualScrollItemSize]="38"
          [virtualScrollOptions]="{ lazy: true }"
          [loading]="loading()"
          (onChange)="onSelectChange($event)"
          (onFilter)="onFilterChange($event)"
          (onLazyLoad)="onScrollPagination.emit($event)"
          [showClear]="true"
          [class]="'w-full custom-select' + (hasError() ? 'border-red-500' : '')"
          panelStyleClass="custom-select-panel"
          optionLabel="label"
          optionValue="value"
          [ngModel]="value()"
          (ngModelChange)="onModelChange($event)"
        >
          <ng-template #item let-item>
            @if (item && item.label) {
              {{ item.label }}
            } @else {
              <div class="flex items-center gap-2 py-1">
                <div class="animate-pulse bg-gray-100 h-4 w-24 rounded"></div>
                <span class="text-xs text-gray-400">Loading...</span>
              </div>
            }
          </ng-template>
        </p-select>
        @if (hasError()) {
          <p class="text-red-500 text-xs mt-1">{{ errorMessage() }}</p>
        }
      </div>
    </div>
  `,
  styleUrl: "./b-select.component.css",
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => BSelectComponent),
      multi: true,
    },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BSelectComponent implements ControlValueAccessor, OnDestroy {
  id = input<string>('');
  label = input<string>('');
  placeholder = input<string>('');
  options = input<any[]>([]); // Changed to any[] to allow for padded nulls/placeholders
  filter = input<boolean>(false);
  virtualScroll = input<boolean>(false);
  loading = input<boolean>(false);
  hasError = input<boolean>(false);
  errorMessage = input<string | null>(null);
  // Outputs
  onSearch = output<string>();
  onScrollPagination = output<any>();

  value = signal<any>('');
  disabled = signal<boolean>(false);

  private searchSubject = new Subject<string>();
  private searchSubscription = this.searchSubject
    .pipe(debounceTime(300), distinctUntilChanged())
    .subscribe((text) => this.onSearch.emit(text));

  onChange: any = () => { };
  onTouched: any = () => { };

  onSelectChange(event: any) {
    const val = event.value;
    this.value.set(val);
    this.onChange(val);
  }

  onModelChange(val: any) {
    this.value.set(val);
    this.onChange(val);
  }

  onFilterChange(event: any) {
    this.searchSubject.next(event.filter);
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

  ngOnDestroy(): void {
    this.searchSubscription.unsubscribe();
  }
}

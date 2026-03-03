import {
  Component,
  input,
  signal,
  forwardRef,
  ChangeDetectionStrategy,
  output,
  OnDestroy,
} from '@angular/core';
import {
  ControlValueAccessor,
  FormsModule,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MultiSelectModule } from 'primeng/multiselect';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';
import { BLableComponent } from "../b-lable/b-lable.component";

@Component({
  selector: 'app-b-multi-select',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, MultiSelectModule, BLableComponent],
  templateUrl: './b-multi-select.component.html',
  styleUrl: './b-multi-select.component.css',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => BMultiSelectComponent),
      multi: true,
    },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BMultiSelectComponent implements ControlValueAccessor, OnDestroy {
  id = input<string>('');
  label = input<string>('');
  subLable = input<string>('');
  placeholder = input<string>('');
  options = input<any[]>([]);
  filter = input<boolean>(false);
  loading = input<boolean>(false);
  hasError = input<boolean>(false);
  errorMessage = input<string | null>(null);

  // Outputs
  onSearch = output<string>();

  value = signal<any[]>([]);
  disabled = signal<boolean>(false);

  private searchSubject = new Subject<string>();
  private searchSubscription = this.searchSubject
    .pipe(debounceTime(300), distinctUntilChanged())
    .subscribe((text) => this.onSearch.emit(text));

  onChange: any = () => { };
  onTouched: any = () => { };

  onModelChange(val: any) {
    this.value.set(val || []);
    this.onChange(val || []);
  }

  onFilterChange(event: any) {
    this.searchSubject.next(event.filter);
  }

  writeValue(value: any): void {
    this.value.set(value || []);
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

import { Component, ChangeDetectionStrategy, input, output, signal, effect } from '@angular/core';
import { LucideAngularModule, Search, Plus, Calendar } from 'lucide-angular';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { DatePickerModule } from 'primeng/datepicker';
import { IftaLabelModule } from 'primeng/iftalabel';

@Component({
  selector: 'app-b-page-header',
  standalone: true,
  imports: [LucideAngularModule, FormsModule, DatePickerModule, IftaLabelModule],
  templateUrl: './b-page-header.component.html',
  styleUrl: './b-page-header.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BPageHeaderComponent {
  // Inputs
  title = input.required<string>();
  placeholder = input<string>('Search for...');
  createButtonLabel = input<string>('Create');
  showCreateButton = input<boolean>(true);
  showSearch = input<boolean>(false);
  // Outputs
  searchChange = output<string>();
  createClick = output<void>();
  dateChange = output<{ from: string; to: string }>();

  // Inputs for showing filters
  showDateFilter = input<boolean>(false);

  // Icons
  readonly searchIcon = Search;
  readonly plusIcon = Plus;
  readonly calendarIcon = Calendar;

  // Internal search state
  searchText = signal<string>('');
  dateFrom = signal<Date | null>(null);
  dateTo = signal<Date | null>(null);

  // Debounced search using Signals and RxJS Interop
  private searchText$ = toObservable(this.searchText);
  private debouncedSearchText = toSignal(
    this.searchText$.pipe(debounceTime(400), distinctUntilChanged()),
    { initialValue: '' },
  );

  constructor() {
    // Effect to emit search change when debounced signal updates
    effect(() => {
      const val = this.debouncedSearchText();
      // Only emit if it's not the initial empty value of the signal (or handle as needed)
      this.searchChange.emit(val);
    });

    effect(() => {
      const from = this.dateFrom();
      const to = this.dateTo();

      const formatLocal = (date: Date | null) => {
        if (!date) return '';
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      };

      this.dateChange.emit({
        from: formatLocal(from),
        to: formatLocal(to),
      });
    });
  }

  onSearchChange(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchText.set(value);
  }

  onCreateClick(): void {
    this.createClick.emit();
  }
}

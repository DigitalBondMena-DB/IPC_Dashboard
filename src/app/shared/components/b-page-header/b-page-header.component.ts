import { Component, ChangeDetectionStrategy, input, output, signal, effect } from '@angular/core';
import { LucideAngularModule, Search, Plus } from 'lucide-angular';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { debounceTime, distinctUntilChanged } from 'rxjs';

@Component({
  selector: 'app-b-page-header',
  standalone: true,
  imports: [LucideAngularModule],
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

  // Outputs
  searchChange = output<string>();
  createClick = output<void>();

  // Icons
  readonly searchIcon = Search;
  readonly plusIcon = Plus;

  // Internal search state
  searchText = signal<string>('');

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
  }

  onSearchChange(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchText.set(value);
  }

  onCreateClick(): void {
    this.createClick.emit();
  }
}

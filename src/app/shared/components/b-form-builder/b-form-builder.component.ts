import { Component, input, output, OnInit, ChangeDetectionStrategy, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { IFormField } from '@shared/models/form-field.model';
import { BInputComponent } from '../b-input/b-input.component';
import { BSelectComponent } from '../b-select/b-select.component';
import { BCheckboxComponent } from '../b-checkbox/b-checkbox.component';

@Component({
  selector: 'app-b-form-builder',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    BInputComponent,
    BSelectComponent,
    BCheckboxComponent,
  ],
  templateUrl: './b-form-builder.component.html',
  styleUrl: './b-form-builder.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BFormBuilderComponent implements OnInit {
  private readonly fb = inject(FormBuilder);

  // Inputs
  fields = input.required<IFormField[]>();
  initialData = input<any>({});
  submitLabel = input<string>('Save Changes');
  cancelLabel = input<string>('Cancel');
  loading = input<boolean>(false);

  // Outputs
  formSubmit = output<any>();
  formCancel = output<void>();

  form!: FormGroup;

  ngOnInit(): void {
    this.buildForm();
  }

  private buildForm(): void {
    const group: any = {};
    const data = this.initialData() || {};

    this.fields().forEach((field) => {
      group[field.key] = [data[field.key] || '', field.validators || []];
    });

    this.form = this.fb.group(group);
  }

  onSubmit(): void {
    if (this.form.valid) {
      this.formSubmit.emit(this.form.value);
    } else {
      this.form.markAllAsTouched();
    }
  }

  onCancel(): void {
    this.formCancel.emit();
  }

  getControl(key: string) {
    return this.form.get(key);
  }

  isTouched(key: string): boolean {
    return this.form.get(key)?.touched || false;
  }

  isValid(key: string): boolean {
    return this.form.get(key)?.valid || false;
  }
}

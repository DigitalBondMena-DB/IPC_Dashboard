import { IFormField } from '@shared/models/form-field.model';
import { Validators } from '@angular/forms';

export const DIVISION_FORM_CONFIG: IFormField[] = [
  {
    key: 'name',
    label: 'Division Name',
    type: 'text',
    placeholder: 'Enter division name',
    validators: [Validators.required],
    colSpan: 'col-span-1',
  },
];

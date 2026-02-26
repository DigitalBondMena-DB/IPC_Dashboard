import { IFormField } from '@shared/models/form-field.model';
import { Validators } from '@angular/forms';

export const AUTHORITY_FORM_CONFIG: IFormField[] = [
  {
    key: 'name',
    label: 'Authority Name',
    type: 'text',
    placeholder: 'Enter authority name',
    validators: [Validators.required],
    colSpan: 'col-span-1',
  },
];

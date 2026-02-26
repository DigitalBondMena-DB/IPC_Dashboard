import { IFormField } from '@shared/models/form-field.model';
import { Validators } from '@angular/forms';

export const HEALTH_DIRECTORATE_FORM_CONFIG: IFormField[] = [
  {
    key: 'name',
    label: 'Directorate Name',
    type: 'text',
    placeholder: 'Enter directorate name',
    validators: [Validators.required],
    colSpan: 'col-span-1',
  },
];

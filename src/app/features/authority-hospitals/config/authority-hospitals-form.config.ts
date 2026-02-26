import { IFormField } from '@shared/models/form-field.model';
import { Validators } from '@angular/forms';

export const getAuthorityHospitalFormConfig = (
  authorities: { label: string; value: any }[],
  divisions: { label: string; value: any }[],
): IFormField[] => [
  {
    key: 'name',
    label: 'Hospital Authority Name',
    type: 'text',
    placeholder: 'Enter name',
    validators: [Validators.required],
    colSpan: 'col-span-2',
  },
  {
    key: 'authority_id',
    label: 'Authority Name',
    type: 'select',
    placeholder: 'Select Authority',
    options: authorities,
    validators: [Validators.required],
    colSpan: 'col-span-1',
  },
  {
    key: 'division_id',
    label: 'Division Name',
    type: 'select',
    placeholder: 'Select Division',
    options: divisions,
    validators: [Validators.required],
    colSpan: 'col-span-1',
  },
];

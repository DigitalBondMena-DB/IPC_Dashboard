import { IFormField } from '@shared/models/form-field.model';
import { Validators } from '@angular/forms';

export const getHospitalFormConfig = (
  directorates: { label: string; value: any }[],
  healthDivisions: { label: string; value: any }[],
  divisions: { label: string; value: any }[],
): IFormField[] => [
  {
    key: 'name',
    label: 'Hospital Name',
    type: 'text',
    placeholder: 'Enter hospital name',
    validators: [Validators.required],
    colSpan: 'col-span-2',
  },
  {
    key: 'health_directorate_id',
    label: 'Health Directorate',
    type: 'select',
    placeholder: 'Select Directorate',
    options: directorates,
    validators: [Validators.required],
    colSpan: 'col-span-1',
  },
  {
    key: 'health_division_id',
    label: 'Health Division',
    type: 'select',
    placeholder: 'Select Health Division',
    options: healthDivisions,
    validators: [Validators.required],
    colSpan: 'col-span-1',
  },
  {
    key: 'division_id',
    label: 'Division',
    type: 'select',
    placeholder: 'Select Division',
    options: divisions,
    validators: [Validators.required],
    colSpan: 'col-span-1',
  },
];

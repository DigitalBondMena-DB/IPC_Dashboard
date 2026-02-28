import { IFormField } from '@shared/models/form-field.model';
import { Validators } from '@angular/forms';

export const getHealthDivisionFormConfig = (
  directorates: { label: string; value: any }[],
  isOptionsLoading: boolean = false,
): IFormField[] => [
    {
      key: 'name',
      label: 'Division Name',
      type: 'text',
      placeholder: 'Enter division name',
      validators: [Validators.required],
      colSpan: 'col-span-1',
    },
    {
      key: 'health_directorate_id',
      label: 'Health Directorate',
      type: 'select',
      placeholder: 'Select health directorate',
      options: directorates,
      validators: [Validators.required],
      colSpan: 'col-span-1',
      filter: true,
      virtualScroll: true,
      loading: isOptionsLoading,
    },
  ];

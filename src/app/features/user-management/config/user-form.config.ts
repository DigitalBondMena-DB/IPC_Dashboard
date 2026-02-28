import { IFormField } from '@shared/models/form-field.model';
import { Validators } from '@angular/forms';

export const getUserFormConfig = (
  entityLabel: string,
  entityKey: string,
  entityOptions: { label: string; value: any }[],
  isEdit: boolean = false,
  isOptionsLoading: boolean = false,
): IFormField[] => {
  const fields: IFormField[] = [
    {
      key: 'username',
      label: 'Username',
      type: 'text',
      placeholder: 'Enter username',
      validators: [Validators.required],
      colSpan: 'col-span-1',
    },
    {
      key: 'email',
      label: 'Email',
      type: 'email',
      placeholder: 'Enter email address',
      validators: [Validators.required, Validators.email],
      colSpan: 'col-span-1',
    },
    {
      key: 'phone',
      label: 'Phone',
      type: 'text',
      placeholder: 'Enter phone number',
      validators: [Validators.required],
      colSpan: 'col-span-1',
    },
    {
      key: entityKey,
      label: entityLabel,
      type: 'select',
      placeholder: `Select ${entityLabel}`,
      options: entityOptions,
      validators: [Validators.required],
      colSpan: 'col-span-1',
      filter: true,
      virtualScroll: true,
      loading: isOptionsLoading,
    },
  ];

  if (!isEdit) {
    fields.push(
      {
        key: 'password',
        label: 'Password',
        type: 'password',
        placeholder: 'Enter password',
        validators: [Validators.required, Validators.minLength(8)],
        colSpan: 'col-span-1',
      },
      {
        key: 'password_confirmation',
        label: 'Confirm Password',
        type: 'password',
        placeholder: 'Confirm password',
        validators: [Validators.required],
        colSpan: 'col-span-1',
      },
    );
  }

  return fields;
};

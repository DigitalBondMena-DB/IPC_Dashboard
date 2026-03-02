import { IFormField } from '@shared/models/form-field.model';
import { Validators } from '@angular/forms';

export const getUserFormConfig = (
  userType: string,
  deps: any = {},
  isEdit: boolean = false,
): IFormField[] => {
  const commonFields: IFormField[] = [
    {
      key: 'name',
      label: 'User Name',
      type: 'text',
      placeholder: 'Enter user name',
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
      key: 'phone_number',
      label: 'Phone',
      type: 'text',
      placeholder: 'Enter phone number',
      validators: [Validators.required],
      colSpan: 'col-span-1',
    },
  ];

  let roleFields: IFormField[] = [];

  switch (userType) {
    case 'ministry': // SUPER_ADMIN
      roleFields = [
        {
          key: 'division_id',
          label: 'Division',
          type: 'select',
          placeholder: 'Select Division',
          options: deps.generalDivisions || [],
          validators: [Validators.required],
          colSpan: 'col-span-1',
          filter: true,
          loading: deps.isGeneralDivisionsLoading,
        },
      ];
      break;

    case 'governorate': // HEALTH_DIRECTORATE
      roleFields = [
        {
          key: 'health_directorate_id',
          label: 'Health Directorate',
          type: 'select',
          placeholder: 'Select Health Directorate',
          options: deps.directorates || [],
          validators: [Validators.required],
          colSpan: 'col-span-1',
          filter: true,
          loading: deps.isDirectoratesLoading,
        },
      ];
      break;

    case 'medical_area': // HEALTH_DIVISION
      roleFields = [
        {
          key: 'health_directorate_id',
          label: 'Health Directorate',
          type: 'select',
          placeholder: 'Select Health Directorate',
          options: deps.directorates || [],
          validators: [Validators.required],
          colSpan: 'col-span-1',
          filter: true,
          loading: deps.isDirectoratesLoading,
        },
        {
          key: 'health_division_id',
          label: 'Division Name',
          type: 'select',
          placeholder: 'Select Division',
          options: deps.healthDivisions || [],
          validators: [Validators.required],
          colSpan: 'col-span-1',
          filter: true,
          loading: deps.isHealthDivisionsLoading,
          dependsOn: 'health_directorate_id',
        },
      ];
      break;

    case 'hospital': // HOSPITAL
      roleFields = [
        {
          key: 'health_directorate_id',
          label: 'Health Directorate',
          type: 'select',
          placeholder: 'Select Health Directorate',
          options: deps.directorates || [],
          validators: [Validators.required],
          colSpan: 'col-span-1',
          filter: true,
          loading: deps.isDirectoratesLoading,
        },
        {
          key: 'health_division_id',
          label: 'Health Area',
          type: 'select',
          placeholder: 'Select Health Area',
          options: deps.healthDivisions || [],
          validators: [Validators.required],
          colSpan: 'col-span-1',
          filter: true,
          loading: deps.isHealthDivisionsLoading,
          dependsOn: 'health_directorate_id',
        },
        {
          key: 'hospital_id',
          label: 'Hospital Name',
          type: 'select',
          placeholder: 'Select Hospital',
          options: deps.hospitals || [],
          validators: [Validators.required],
          colSpan: 'col-span-1',
          filter: true,
          loading: deps.isHospitalsLoading,
          dependsOn: 'health_division_id',
        },
        {
          key: 'category_ids',
          label: 'General Division',
          type: 'multiselect',
          placeholder: 'Select General Divisions',
          options: deps.generalDivisions || [],
          validators: [Validators.required],
          colSpan: 'col-span-1',
          filter: true,
          loading: deps.isGeneralDivisionsLoading,
        },
      ];
      break;

    case 'authority': // AUTHORITY
      roleFields = [];
      break;

    case 'authority_hospital':
      roleFields = [
        {
          key: 'authority_id',
          label: 'Authority',
          type: 'select',
          placeholder: 'Select Authority',
          options: deps.authorities || [],
          validators: [Validators.required],
          colSpan: 'col-span-1',
          filter: true,
          loading: deps.isAuthoritiesLoading,
        },
        {
          key: 'hospital_id',
          label: 'Hospital',
          type: 'select',
          placeholder: 'Select Hospital',
          options: deps.hospitals || [],
          validators: [Validators.required],
          colSpan: 'col-span-1',
          filter: true,
          loading: deps.isHospitalsLoading,
          dependsOn: 'authority_id',
        },
        {
          key: 'category_ids',
          label: 'General Division',
          type: 'multiselect',
          placeholder: 'Select General Divisions',
          options: deps.generalDivisions || [],
          validators: [Validators.required],
          colSpan: 'col-span-1',
          filter: true,
          loading: deps.isGeneralDivisionsLoading,
        },
      ];
      break;
  }

  const fields = [...commonFields, ...roleFields];

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

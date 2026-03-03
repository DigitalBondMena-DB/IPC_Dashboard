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
      placeholder: 'Enter user name...',
      validators: [Validators.required],
      colSpan: 'col-span-1',
    },
    {
      key: 'email',
      label: 'Email',
      type: 'email',
      placeholder: 'Enter email address...',
      validators: [Validators.required, Validators.email],
      colSpan: 'col-span-1',
    },
    {
      key: 'phone_number',
      label: 'Phone',
      type: 'text',
      placeholder: 'Enter phone number...',
      validators: [Validators.required, Validators.pattern(/^[0-9]+$/)],
      colSpan: 'col-span-1',
    },
    {
      key: 'password',
      label: 'Password',
      type: 'password',
      placeholder: '********',
      validators: [Validators.minLength(8)],
      colSpan: 'col-span-1',
    },
    {
      key: 'password_confirmation',
      label: 'Confirm Password',
      type: 'password',
      placeholder: '********',
      validators: [],
      colSpan: 'col-span-1',
    },
  ];

  let roleFields: IFormField[] = [];

  switch (userType) {
    case 'ministry': // SUPER_ADMIN
      roleFields = [
        {
          key: 'category_ids',
          label: 'Division',
          type: 'multiselect',
          subLable: '(All Selected by Default)',
          placeholder: 'Select Divisions',
          options: deps.generalDivisions || [],
          validators: [],
          colSpan: 'col-span-1',
          filter: true,
          loading: deps.isGeneralDivisionsLoading,
        },
      ];
      break;

    case 'governorate': // HEALTH_DIRECTORATE
      roleFields = [
        {
          key: 'name',
          label: 'User Name',
          type: 'text',
          placeholder: 'Enter user name...',
          validators: [Validators.required],
          colSpan: 'col-span-1',
        },
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
          key: 'name',
          label: 'User Name',
          type: 'text',
          placeholder: 'Enter Super Admin name...',
          validators: [Validators.required],
          colSpan: 'col-span-1',
        },
        {
          key: 'category_ids',
          label: 'Division',
          type: 'multiselect',
          subLable: '(All Selected by Default)',
          placeholder: 'Select Divisions',
          options: deps.healthDivisions || [],
          validators: [],
          colSpan: 'col-span-1',
          filter: true,
          loading: deps.isHealthDivisionsLoading,
        },
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

        // {
        //   key: 'health_division_id',
        //   label: 'Division Name',
        //   type: 'select',
        //   placeholder: 'Select Division',
        //   options: deps.healthDivisions || [],
        //   validators: [Validators.required],
        //   colSpan: 'col-span-1',
        //   filter: true,
        //   loading: deps.isHealthDivisionsLoading,
        //   dependsOn: 'health_directorate_id',
        // },
      ];
      break;

    case 'hospital': // HOSPITAL
      roleFields = [
        {
          key: 'name',
          label: 'User Name',
          type: 'text',
          placeholder: 'Enter Super Admin name...',
          validators: [Validators.required],
          colSpan: 'col-span-1',
        },
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
          label: 'Division',
          type: 'multiselect',
          placeholder: 'Select General Divisions',
          options: deps.generalDivisions || [],
          validators: [],
          colSpan: 'col-span-1',
          filter: true,
          loading: deps.isGeneralDivisionsLoading,
        },
      ];
      break;

    case 'authority': // AUTHORITY
      roleFields = [
        {
          key: 'name',
          label: 'User Name',
          type: 'text',
          placeholder: 'Enter Super Admin name...',
          validators: [Validators.required],
          colSpan: 'col-span-1',
        },
      ];
      break;

    case 'authority_hospital':
      roleFields = [
        {
          key: 'name',
          label: 'User Name',
          type: 'text',
          placeholder: 'Enter Super Admin name...',
          validators: [Validators.required],
          colSpan: 'col-span-1',
        },
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
          label: 'Division',
          type: 'multiselect',
          placeholder: 'Select Divisions...',
          options: deps.generalDivisions || [],
          validators: [],
          colSpan: 'col-span-1',
          filter: true,
          loading: deps.isGeneralDivisionsLoading,
        },
      ];
      break;
  }

  const fields = [...commonFields, ...roleFields];

  if (!isEdit) {
    fields.push();
  }

  return fields;
};

export interface IFormField {
  key: string;
  label: string;
  type: 'text' | 'password' | 'email' | 'checkbox' | 'select';
  placeholder?: string;
  options?: { label: string; value: any }[];
  validators?: any[];
  colSpan?: string;
  filter?: boolean;
  virtualScroll?: boolean;
  loading?: boolean;
}

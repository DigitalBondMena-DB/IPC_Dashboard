export interface ITableColumn {
  field: string;
  header: string;
  sortable?: boolean;
  is_active_actions?: boolean;
  type?: 'text' | 'date' | 'toggle';
}

export interface ITableParams {
  page: number;
  per_page: number;
  search: string;
  sort_by: string;
  sort_dir: 'asc' | 'desc' | '';
}

export interface IDivision {
  current_page: number;
  data: Data[];
  first_page_url: string;
  from: number;
  last_page: number;
  last_page_url: string;
  links: Link[];
  next_page_url: any;
  path: string;
  per_page: number;
  prev_page_url: any;
  to: number;
  total: number;
}

interface Data {
  id: number;
  name: string;
  is_active: boolean;
  users_count: number;
  surveys_count: number;
  updated_at: string;
  created_at: string;
  updated_by: string;
}

interface Link {
  url?: string;
  label: string;
  page?: number;
  active: boolean;
}

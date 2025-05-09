export interface Filter {
  id: number | string;
  count: number;
  description: string;
  hasFocus?: boolean;
}

export interface FilterMenuContent {
  type: string;
  label: string;
  options: Filter[];
  param: string; // Name of the query parameter
}

export interface FilterChip {
  param: string;
  id: string;
  label: string;
}

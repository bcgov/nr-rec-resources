export interface Filter {
  id: string;
  count: number;
  description: string;
}

export interface FilterMenuContent {
  label: string;
  options: Filter[];
  param: string; // Name of the query parameter
}

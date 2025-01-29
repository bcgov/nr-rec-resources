export interface Filter {
  id: string;
  count: number;
  description: string;
}

export interface FilterMenuContent {
  title: string;
  filters: Filter[];
  param: string; // Name of the query parameter
}

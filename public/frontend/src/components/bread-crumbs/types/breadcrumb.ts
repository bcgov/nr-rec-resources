export interface BreadcrumbItem {
  label: string;
  href?: string;
  isCurrent?: boolean;
}

export interface BreadcrumbState {
  items: BreadcrumbItem[];
  previousRoute?: string;
}

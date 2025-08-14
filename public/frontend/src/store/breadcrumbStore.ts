import { Store } from '@tanstack/store';
import { BreadcrumbState } from '@/components/bread-crumbs/types/breadcrumb';

const initialBreadcrumbState: BreadcrumbState = {
  items: [],
  previousRoute: undefined,
};

const breadcrumbStore = new Store<BreadcrumbState>(initialBreadcrumbState);

export default breadcrumbStore;

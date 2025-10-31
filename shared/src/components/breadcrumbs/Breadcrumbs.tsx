/**
 * Breadcrumb Component
 *
 * A flexible breadcrumb navigation component that reads breadcrumbs
 * from TanStack Router's route context or accepts manual items.
 */

import { Breadcrumb } from 'react-bootstrap';
import { useMatches } from '@tanstack/react-router';
import { BreadcrumbItem } from './types';
import {
  getBreadcrumbItemProps,
  getBreadcrumbKey,
  renderBreadcrumbLabel,
} from './helpers';
import './Breadcrumbs.scss';

export interface BreadcrumbsProps {
  /**
   * Optional array of breadcrumb items.
   * If not provided, reads from route context via useMatches().
   */
  items?: BreadcrumbItem[];

  /**
   * Optional additional class name(s) for the breadcrumb container.
   */
  className?: string;

  /**
   * Whether to show home icon on the first breadcrumb item.
   * @default true
   */
  showHomeIcon?: boolean;

  /**
   * Custom aria-label for the breadcrumb navigation.
   * @default "Breadcrumb navigation"
   */
  ariaLabel?: string;
}

/**
 * Breadcrumb navigation component
 *
 * Renders a breadcrumb navigation bar using React Bootstrap.
 * Reads breadcrumbs from route context or uses manually provided items.
 */
export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({
  items,
  className = '',
  showHomeIcon = true,
  ariaLabel = 'Breadcrumb navigation',
}) => {
  const matches = useMatches();

  // Get breadcrumb function from the last matched route's context
  const lastMatch = matches[matches.length - 1];
  const breadcrumbFn = (lastMatch?.context as any)?.breadcrumb;
  const loaderData = lastMatch?.loaderData;

  // Generate breadcrumbs from route context or use provided items
  const routeBreadcrumbs = breadcrumbFn?.(loaderData) || [];
  const breadcrumbItems = items || routeBreadcrumbs;

  return (
    <Breadcrumb
      className={className}
      aria-label={ariaLabel}
      data-testid="breadcrumbs"
    >
      {breadcrumbItems.map((item: BreadcrumbItem, index: number) => {
        const isFirst = index === 0;
        const isLast = index === breadcrumbItems.length - 1;
        const key = getBreadcrumbKey(item, index);

        return (
          <Breadcrumb.Item key={key} {...getBreadcrumbItemProps(item, isLast)}>
            {renderBreadcrumbLabel(item, showHomeIcon, isFirst)}
          </Breadcrumb.Item>
        );
      })}
    </Breadcrumb>
  );
};

export default Breadcrumbs;

/**
 * Breadcrumb Component
 *
 * A flexible breadcrumb navigation component that supports both
 * store-driven and manually provided breadcrumb items.
 */

import { Breadcrumb } from 'react-bootstrap';
import { useStore } from '@tanstack/react-store';
import { breadcrumbStore } from './store/breadcrumbStore';
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
   * If not provided, uses the global breadcrumb store.
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
 * Supports both store-driven and manually provided breadcrumb items.
 */
export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({
  items,
  className = '',
  showHomeIcon = true,
  ariaLabel = 'Breadcrumb navigation',
}) => {
  const state = useStore(breadcrumbStore);

  // Use provided items or fall back to store items
  const breadcrumbItems = items || state.items;

  // Don't render if no breadcrumb items
  if (!breadcrumbItems?.length) {
    return null;
  }

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

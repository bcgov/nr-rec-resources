import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHouse } from '@fortawesome/free-solid-svg-icons';
import { BreadcrumbItem } from './types';
import { BreadcrumbItemProps } from 'react-bootstrap';
import { ReactNode } from 'react';

/**
 * Render breadcrumb label with optional home icon
 */
export function renderBreadcrumbLabel(
  item: BreadcrumbItem,
  showHomeIcon: boolean = true,
  isFirst: boolean = false,
): ReactNode {
  if (isFirst && showHomeIcon) {
    return (
      <FontAwesomeIcon
        className="h-100"
        icon={faHouse}
        aria-label="Home"
        title="Home"
      />
    );
  }
  return item.label;
}

/**
 * Generate props for React Bootstrap Breadcrumb.Item
 */
export function getBreadcrumbItemProps(
  item: BreadcrumbItem,
  isLast: boolean,
): BreadcrumbItemProps {
  const isActive = item.isCurrent || isLast;

  return {
    linkAs: item.href && !isActive ? Link : 'span',
    linkProps:
      item.href && !isActive ? { to: item.href, 'aria-label': item.label } : {},
    active: isActive,
    ...(isActive && { 'aria-current': 'page' }),
  };
}

/**
 * Generate unique key for breadcrumb items
 */
export function getBreadcrumbKey(item: BreadcrumbItem, index: number): string {
  return item.href !== undefined ? item.href : `breadcrumb-${index}`;
}

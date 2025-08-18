/**
 * Breadcrumb rendering utilities
 */

import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHouse } from '@fortawesome/free-solid-svg-icons';
import { BreadcrumbItem } from '../types';
import { BreadcrumbItemProps } from 'react-bootstrap';

/**
 * Render breadcrumb label with optional home icon
 */
export function renderBreadcrumbLabel(
  item: BreadcrumbItem,
  showHomeIcon: boolean = true,
  isFirst: boolean = false,
): React.ReactNode {
  if (isFirst && showHomeIcon) {
    return <FontAwesomeIcon icon={faHouse} aria-label="Home" />;
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
    linkProps: item.href && !isActive ? { to: item.href } : {},
    active: isActive,
    ...(isActive && { 'aria-current': 'page' }),
  };
}

/**
 * Generate unique key for breadcrumb items
 */
export function getBreadcrumbKey(item: BreadcrumbItem, index: number): string {
  return item.href || `breadcrumb-${index}`;
}

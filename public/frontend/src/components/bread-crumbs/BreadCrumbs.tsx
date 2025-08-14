import { useStore } from '@tanstack/react-store';
import breadcrumbStore from '@/store/breadcrumbStore';
import { BreadcrumbItem } from '@/components/bread-crumbs/types/breadcrumb';
import HomeIcon from '@/images/icons/home.svg';
import ChevronRightIcon from '@/images/icons/chevron-right.svg';
import './BreadCrumbs.scss';

interface BreadCrumbsProps {
  items?: BreadcrumbItem[];
  className?: string;
}

/**
 * Enhanced BreadCrumbs component that supports both store-driven and manual breadcrumb items
 */
const BreadCrumbs = ({ items, className = '' }: BreadCrumbsProps) => {
  const { items: storeItems } = useStore(breadcrumbStore);

  // Use provided items or fall back to store breadcrumbs
  const breadcrumbItems = items || storeItems;

  if (!breadcrumbItems?.length) {
    return null;
  }

  return (
    <nav
      className={`breadcrumbs ${className}`}
      aria-label="Breadcrumb navigation"
    >
      {breadcrumbItems.map((item, index) => (
        <span key={index} className="breadcrumb-item">
          {index > 0 && (
            <img
              src={ChevronRightIcon}
              alt="breadcrumb separator"
              className="breadcrumb-separator"
              aria-hidden="true"
            />
          )}

          {item.isCurrent ? (
            <span className="current-path" aria-current="page">
              {item.label}
            </span>
          ) : item.href ? (
            <a href={item.href} className="breadcrumb-link">
              {index === 0 && item.href === '/' ? (
                <span className="home-icon-wrapper">
                  <img src={HomeIcon} alt="Home" className="home-icon" />
                  <span className="sr-only">{item.label}</span>
                </span>
              ) : (
                item.label
              )}
            </a>
          ) : (
            <span className="breadcrumb-text">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
};

export default BreadCrumbs;

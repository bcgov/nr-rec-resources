import { useMemo, useState, type ReactNode } from 'react';
import { Dropdown } from 'react-bootstrap';
import './CheckboxDropdownField.scss';

export interface CheckboxDropdownItem {
  value: string;
  label: string;
}

interface CheckboxDropdownFieldProps {
  className?: string;
  label: ReactNode;
  items: CheckboxDropdownItem[];
  selectedValues?: string[];
  onToggle: (value: string) => void;
  showSelectedCount?: boolean;
  variant?: string;
  toggleStyle?: 'button' | 'field';
  icon?: ReactNode;
  searchable?: boolean;
  searchPlaceholder?: string;
  noResultsText?: string;
}

function highlightMatch(text: string, query: string): ReactNode {
  if (!query) return text;
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${escaped})`, 'gi');
  return text.split(regex).map((part, i) =>
    regex.test(part) ? (
      <mark className="checkbox-dropdown__match" key={i}>
        {part}
      </mark>
    ) : (
      part
    ),
  );
}

export function CheckboxDropdownField({
  className,
  label,
  items,
  selectedValues = [],
  onToggle,
  showSelectedCount = false,
  variant,
  toggleStyle = 'button',
  icon,
  searchable = false,
  searchPlaceholder = 'Search options',
  noResultsText = 'No matches found',
}: Readonly<CheckboxDropdownFieldProps>) {
  const [searchQuery, setSearchQuery] = useState('');
  const trimmedQuery = searchQuery.trim();

  const resolvedVariant =
    variant ??
    (toggleStyle === 'field' ? 'outline-secondary' : 'outline-primary');

  const selectedCount = selectedValues.length;
  const selectedValueSet = new Set(selectedValues);

  const toggleLabel =
    showSelectedCount && selectedCount > 0 && typeof label === 'string'
      ? `${label} (${selectedCount})`
      : label;

  const filteredItems = useMemo(
    () =>
      items.filter((item) =>
        item.label.toLowerCase().includes(trimmedQuery.toLowerCase()),
      ),
    [items, trimmedQuery],
  );

  const searchAriaLabel =
    typeof label === 'string' ? `Search ${label}` : 'Search options';

  return (
    <Dropdown
      autoClose="outside"
      className={`checkbox-dropdown checkbox-dropdown--${toggleStyle}`}
      onToggle={(nextShow) => {
        if (!nextShow) setSearchQuery('');
      }}
    >
      <Dropdown.Toggle
        variant={resolvedVariant}
        className={[
          className,
          'checkbox-dropdown__toggle',
          `checkbox-dropdown__toggle--${toggleStyle}`,
          toggleStyle === 'field'
            ? 'w-100 text-start d-flex align-items-center justify-content-between'
            : 'd-inline-flex align-items-center',
          icon ? 'checkbox-dropdown__toggle--with-icon' : '',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        <span className="checkbox-dropdown__toggle-content">
          {icon ? (
            <span className="d-inline-flex align-items-center flex-shrink-0">
              {icon}
            </span>
          ) : null}
          <span className="checkbox-dropdown__toggle-label">{toggleLabel}</span>
        </span>
      </Dropdown.Toggle>

      <Dropdown.Menu className="checkbox-dropdown__menu">
        {searchable ? (
          <div className="checkbox-dropdown__search-wrap px-2 py-2">
            <input
              type="search"
              className="form-control form-control-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={searchPlaceholder}
              aria-label={searchAriaLabel}
            />
          </div>
        ) : null}

        {filteredItems.length > 0 ? (
          filteredItems.map((item) => (
            <Dropdown.Item
              as="button"
              key={item.value}
              onClick={() => onToggle(item.value)}
              className="checkbox-dropdown__item"
            >
              <input
                type="checkbox"
                checked={selectedValueSet.has(item.value)}
                readOnly
                className="checkbox-dropdown__checkbox"
              />
              <span className="checkbox-dropdown__label">
                {highlightMatch(item.label, trimmedQuery)}
              </span>
            </Dropdown.Item>
          ))
        ) : (
          <div className="checkbox-dropdown__empty-state px-3 py-2 text-muted small">
            {noResultsText}
          </div>
        )}
      </Dropdown.Menu>
    </Dropdown>
  );
}

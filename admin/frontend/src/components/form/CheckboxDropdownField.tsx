import type { ReactNode } from 'react';
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
  selectedValues: string[];
  onToggle: (value: string) => void;
  showSelectedCount?: boolean;
  variant?: string;
  toggleStyle?: 'button' | 'field';
  icon?: ReactNode;
}

export function CheckboxDropdownField({
  className,
  label,
  items,
  selectedValues,
  onToggle,
  showSelectedCount = false,
  variant,
  toggleStyle = 'button',
  icon,
}: CheckboxDropdownFieldProps) {
  const resolvedVariant =
    variant ??
    (toggleStyle === 'field' ? 'outline-secondary' : 'outline-primary');
  const selectedCount = selectedValues.length;
  const selectedValueSet = new Set(selectedValues);
  const toggleLabel =
    showSelectedCount && selectedCount > 0 && typeof label === 'string'
      ? `${label} (${selectedCount})`
      : label;

  return (
    <Dropdown
      autoClose="outside"
      className={`checkbox-dropdown checkbox-dropdown--${toggleStyle}`}
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
        {items.map((item) => (
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
            <span className="checkbox-dropdown__label">{item.label}</span>
          </Dropdown.Item>
        ))}
      </Dropdown.Menu>
    </Dropdown>
  );
}

import './ToggleGroup.scss';

interface ToggleGroupProps {
  value: boolean;
  onChange: (value: boolean) => void;
  label?: string;
}

export const ToggleGroup: React.FC<ToggleGroupProps> = ({
  value,
  onChange,
  label,
}) => {
  return (
    <div aria-label="Toggle visibility on public site">
      {label && (
        <label className="form-label d-block fw-semibold">{label}</label>
      )}
      <div
        className="d-inline-flex p-1 rounded-3 gap-1 toggle-group"
        role="radiogroup"
        aria-label={label || 'Display on public site'}
      >
        <button
          type="button"
          role="radio"
          aria-checked={value === true}
          className={`btn px-3 py-2 border-0 fw-medium ${value === true ? 'active-pill shadow-sm bg-white text-dark' : 'text-muted bg-transparent'}`}
          onClick={() => onChange(true)}
        >
          Yes
        </button>
        <button
          type="button"
          role="radio"
          aria-checked={value === false}
          className={`btn px-3 py-2 border-0 fw-medium ${value === false ? 'active-pill shadow-sm bg-white text-dark' : 'text-muted bg-transparent'}`}
          onClick={() => onChange(false)}
        >
          No
        </button>
      </div>
    </div>
  );
};

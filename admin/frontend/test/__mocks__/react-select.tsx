/**
 * Shared mock for react-select
 */
import { vi } from 'vitest';

// Helper functions
const flattenOptions = (options: any[]) => {
  const isGrouped = options?.some((opt) => opt.options);
  return isGrouped
    ? options?.flatMap((group) => (group.options ? group.options : [group]))
    : options;
};

const getMatchKey = (flatOptions: any[]) => {
  const useValueMatch = flatOptions?.some((opt) => opt.value !== undefined);
  return useValueMatch ? 'value' : 'id';
};

const getOptValue = (
  opt: any,
  matchKey: string,
  getOptionValueProp?: (opt: any) => any,
) => {
  return getOptionValueProp ? getOptionValueProp(opt) : opt[matchKey];
};

const getOptLabel = (opt: any, getOptionLabelProp?: (opt: any) => string) => {
  return getOptionLabelProp ? getOptionLabelProp(opt) : opt.label;
};

// Mock component implementation
const MockReactSelect = vi.fn((props: any) => {
  const flatOpts = flattenOptions(props.options || []);
  const matchKey = getMatchKey(flatOpts || []);

  // Handle single select
  if (!props.isMulti) {
    const selectedOption =
      flatOpts?.find(
        (opt: any) =>
          getOptValue(opt, matchKey, props.getOptionValue) === props.value,
      ) || null;

    return (
      <div data-testid="mock-select" className={props.className}>
        <input
          type="text"
          role="combobox"
          value={
            selectedOption
              ? getOptLabel(selectedOption, props.getOptionLabel) || ''
              : ''
          }
          placeholder={props.placeholder}
          disabled={props.isDisabled}
          readOnly={!props.isSearchable}
          data-testid="select-input"
        />
        {!props.isDisabled && (
          <div data-testid="select-options">
            {flatOpts?.length === 0 ? (
              <div>No options</div>
            ) : (
              flatOpts?.map((opt: any) => {
                const optValue = getOptValue(
                  opt,
                  matchKey,
                  props.getOptionValue,
                );
                const optLabel = getOptLabel(opt, props.getOptionLabel);
                const isDisabledOption = props.isOptionDisabled
                  ? props.isOptionDisabled(opt)
                  : false;
                return (
                  <button
                    key={optValue || 'null'}
                    type="button"
                    onClick={() => !isDisabledOption && props.onChange?.(opt)}
                    disabled={isDisabledOption}
                    data-testid={`option-${optValue}`}
                    data-disabled={isDisabledOption}
                  >
                    {optLabel}
                  </button>
                );
              })
            )}
          </div>
        )}
      </div>
    );
  }

  // Handle multi-select
  const currentValues = Array.isArray(props.value) ? props.value : [];

  return (
    <div data-testid="mock-multi-select" className={props.className}>
      <div data-testid="multi-select-info">
        Multi: {props.isMulti ? 'true' : 'false'}
        {props.closeMenuOnSelect !== undefined &&
          `, CloseOnSelect: ${props.closeMenuOnSelect}`}
      </div>
      <input
        type="text"
        role="combobox"
        placeholder={props.placeholder}
        disabled={props.isDisabled}
        readOnly
        data-testid="multi-select-input"
      />
      <div data-testid="selected-values">
        {currentValues.length > 0
          ? currentValues
              .map((v: any) => getOptLabel(v, props.getOptionLabel))
              .join(', ')
          : 'none'}
      </div>
      {!props.isDisabled && (
        <div data-testid="multi-select-options">
          {flatOpts?.length === 0 ? (
            <div>No options available</div>
          ) : (
            flatOpts?.map((opt: any) => {
              const optValue = getOptValue(opt, matchKey, props.getOptionValue);
              const optLabel = getOptLabel(opt, props.getOptionLabel);
              const isSelected = currentValues.some(
                (v: any) =>
                  getOptValue(v, matchKey, props.getOptionValue) === optValue,
              );

              return (
                <button
                  key={optValue}
                  type="button"
                  onClick={() => {
                    if (isSelected) {
                      props.onChange?.(
                        currentValues.filter(
                          (v: any) =>
                            getOptValue(v, matchKey, props.getOptionValue) !==
                            optValue,
                        ),
                      );
                    } else {
                      props.onChange?.([...currentValues, opt]);
                    }
                  }}
                  data-testid={`option-${optValue}`}
                  data-selected={isSelected}
                >
                  {optLabel}
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
});

// Export as default (the way react-select exports)
export default MockReactSelect;

import { useState } from 'react';
import { Form, InputGroup } from 'react-bootstrap';
import {
  Controller,
  FieldValues,
  Control,
  FieldErrors,
  Path,
} from 'react-hook-form';

export interface CurrencyInputFieldProps<TFieldValues extends FieldValues> {
  name: Path<TFieldValues>;
  label: string;
  placeholder?: string;
  control: Control<TFieldValues>;
  errors: FieldErrors<TFieldValues>;
  required?: boolean;
  disabled?: boolean;
}

interface CurrencyInputProps {
  value: number | undefined;
  onChange: (value: number | undefined) => void;
  onBlur: () => void;
  placeholder: string;
  isInvalid: boolean;
  disabled: boolean;
}

const isValidCurrencyInput = (input: string): boolean => {
  return /^\d*\.?\d*$/.test(input) && (input.match(/\./g) || []).length <= 1;
};

const formatCurrency = (value: number): string => {
  return value.toFixed(2);
};

const CurrencyInput = ({
  value,
  onChange,
  onBlur,
  placeholder,
  isInvalid,
  disabled,
}: CurrencyInputProps) => {
  const [displayValue, setDisplayValue] = useState<string>(() => {
    if (value === undefined || value === null) return '';
    return value.toFixed(2);
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;

    if (input === '') {
      setDisplayValue('');
      onChange(undefined);
      return;
    }

    if (!isValidCurrencyInput(input)) {
      return;
    }

    setDisplayValue(input);

    const numValue = parseFloat(input);
    if (!isNaN(numValue)) {
      onChange(numValue);
    }
  };

  const handleBlur = () => {
    onBlur();

    if (!displayValue || displayValue === '.') {
      setDisplayValue('');
      onChange(undefined);
      return;
    }

    const numValue = parseFloat(displayValue);
    if (!isNaN(numValue)) {
      const formatted = formatCurrency(numValue);
      setDisplayValue(formatted);
      onChange(numValue);
    }
  };

  return (
    <InputGroup>
      <InputGroup.Text>$</InputGroup.Text>
      <Form.Control
        type="text"
        inputMode="decimal"
        placeholder={placeholder}
        value={displayValue}
        onChange={handleChange}
        onBlur={handleBlur}
        isInvalid={isInvalid}
        disabled={disabled}
      />
    </InputGroup>
  );
};

export const CurrencyInputField = <TFieldValues extends FieldValues>({
  name,
  label,
  placeholder = '0.00',
  control,
  errors,
  required = false,
  disabled = false,
}: CurrencyInputFieldProps<TFieldValues>) => (
  <Form.Group controlId={name}>
    <Form.Label>
      {label}
      {required && ' *'}
    </Form.Label>
    <Controller<TFieldValues>
      name={name}
      control={control}
      render={({ field }) => (
        <CurrencyInput
          value={field.value}
          onChange={field.onChange}
          onBlur={field.onBlur}
          placeholder={placeholder}
          isInvalid={!!errors[name]}
          disabled={disabled}
        />
      )}
    />
    <Form.Control.Feedback type="invalid">
      {errors[name]?.message as string}
    </Form.Control.Feedback>
  </Form.Group>
);

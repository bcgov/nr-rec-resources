import { Form, Row, Col } from 'react-bootstrap';
import {
  Controller,
  FieldValues,
  Control,
  FieldErrors,
  Path,
} from 'react-hook-form';
import { MAX_DAYS_PER_MONTH, MONTH_NAMES } from '@/constants/dates';

export interface MonthDayPickerProps<TFieldValues extends FieldValues> {
  name: Path<TFieldValues>;
  label: string;
  control: Control<TFieldValues>;
  errors: FieldErrors<TFieldValues>;
  required?: boolean;
}

/**
 * Collects month + day only (no year). Stores as "MM-DD".
 */
export const MonthDayPicker = <TFieldValues extends FieldValues>({
  name,
  label,
  control,
  errors,
  required = false,
}: MonthDayPickerProps<TFieldValues>) => (
  <Form.Group controlId={name}>
    <Form.Label>
      {label}
      {required && ' *'}
    </Form.Label>
    <Controller<TFieldValues>
      name={name}
      control={control}
      render={({ field }) => {
        const storedValue = (field.value as string | undefined) ?? '';
        const [selectedMonth = '', selectedDay = ''] = storedValue.split('-');
        const dayCount = selectedMonth
          ? MAX_DAYS_PER_MONTH[parseInt(selectedMonth, 10) - 1]
          : 0;
        const hasValidationError = !!errors[name];

        const handleMonthChange = (newMonth: string) => {
          if (!newMonth) {
            field.onChange('');
            return;
          }
          const newDayCount = MAX_DAYS_PER_MONTH[parseInt(newMonth, 10) - 1];
          const retainedDay =
            selectedDay && parseInt(selectedDay, 10) <= newDayCount
              ? selectedDay
              : '';
          field.onChange(
            retainedDay ? `${newMonth}-${retainedDay}` : `${newMonth}-`,
          );
        };

        const handleDayChange = (newDay: string) => {
          field.onChange(
            newDay ? `${selectedMonth}-${newDay}` : `${selectedMonth}-`,
          );
        };

        return (
          <>
            <Row className="g-2">
              <Col xs={7}>
                <Form.Select
                  value={selectedMonth}
                  isInvalid={hasValidationError}
                  onChange={(e) => handleMonthChange(e.target.value)}
                  aria-label={`${label} month`}
                >
                  <option value="">Month</option>
                  {MONTH_NAMES.map((monthName, index) => {
                    const monthValue = String(index + 1).padStart(2, '0');
                    return (
                      <option key={monthValue} value={monthValue}>
                        {monthName}
                      </option>
                    );
                  })}
                </Form.Select>
              </Col>
              <Col xs={5}>
                <Form.Select
                  value={selectedDay}
                  isInvalid={hasValidationError}
                  disabled={!selectedMonth}
                  onChange={(e) => handleDayChange(e.target.value)}
                  aria-label={`${label} day`}
                >
                  <option value="">Day</option>
                  {Array.from({ length: dayCount }, (_, index) => {
                    const dayValue = String(index + 1).padStart(2, '0');
                    return (
                      <option key={dayValue} value={dayValue}>
                        {index + 1}
                      </option>
                    );
                  })}
                </Form.Select>
              </Col>
            </Row>
            {hasValidationError && (
              <Form.Control.Feedback
                type="invalid"
                style={{ display: 'block' }}
              >
                {errors[name]?.message as string}
              </Form.Control.Feedback>
            )}
          </>
        );
      }}
    />
  </Form.Group>
);

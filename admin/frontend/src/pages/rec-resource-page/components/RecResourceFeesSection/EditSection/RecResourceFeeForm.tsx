import {
  CurrencyInputField,
  MonthDayPicker,
  SelectField,
} from '@/components/form';
import {
  RecreationFeeUIModel,
  RecreationResourceOptionUIModel,
} from '@/services';
import { Button, Col, Form, Row, Stack } from 'react-bootstrap';
import { Controller } from 'react-hook-form';
import {
  FEE_APPLIES_OPTIONS,
  type AddFeeFormData,
} from '@/pages/rec-resource-page/components/RecResourceFeesSection/EditSection/schemas/addFee';
import { useFeeForm } from '@/pages/rec-resource-page/components/RecResourceFeesSection/EditSection/hooks/useFeeForm';
import { useFeeOptions } from '@/pages/rec-resource-page/components/RecResourceFeesSection/EditSection/hooks/useFeeOptions';
import {
  DAYS,
  DAY_PRESET_OPTIONS_LIST,
} from '@/pages/rec-resource-page/components/RecResourceFeesSection/EditSection/constants';
import './RecResourceFeeForm.scss';

type FeeFormMode = 'create' | 'edit';

export const RecResourceFeeForm = ({
  recResourceId,
  mode,
  initialFee,
  onDone,
}: {
  recResourceId: string;
  mode: FeeFormMode;
  initialFee?: RecreationFeeUIModel;
  onDone?: () => void;
}) => {
  const { options: feeOptions, isLoading: optionsLoading } = useFeeOptions();
  const {
    control,
    handleSubmit,
    errors,
    isDirty,
    mutation,
    onSubmit,
    feeApplies,
  } = useFeeForm({
    recResourceId,
    mode,
    initialFee,
    onDone,
  });

  const feeTypeOptions: RecreationResourceOptionUIModel[] = feeOptions.map(
    (option: RecreationResourceOptionUIModel) => ({
      id: option.id,
      label: option.label,
    }),
  );

  const submitLabel =
    mode === 'create'
      ? mutation.isPending
        ? 'Adding Fee...'
        : 'Add Fee'
      : mutation.isPending
        ? 'Saving...'
        : 'Save Changes';

  const isRecurring = feeApplies === FEE_APPLIES_OPTIONS.SPECIFIC_DATES;

  return (
    <Form onSubmit={handleSubmit(onSubmit)}>
      <Stack direction="vertical" gap={4}>
        <Controller<AddFeeFormData>
          name="fee_applies"
          control={control}
          render={({ field }) => (
            <Form.Check
              type="checkbox"
              id="fee-recurring"
              label={
                <>
                  <strong>Fee is recurring.</strong> Fee applies every year for
                  the selected dates
                </>
              }
              checked={field.value === FEE_APPLIES_OPTIONS.SPECIFIC_DATES}
              onChange={(e) => {
                const checked = e.target.checked;
                field.onChange(
                  checked
                    ? FEE_APPLIES_OPTIONS.SPECIFIC_DATES
                    : FEE_APPLIES_OPTIONS.ALWAYS,
                );
              }}
            />
          )}
        />

        {isRecurring && (
          <Row className="gy-3">
            <Col xs={12} md={6}>
              <MonthDayPicker
                name="recurring_start_mmdd"
                label="Start Date (Month / Day)"
                control={control}
                errors={errors}
                required
              />
            </Col>
            <Col xs={12} md={6}>
              <MonthDayPicker
                name="recurring_end_mmdd"
                label="End Date (Month / Day)"
                control={control}
                errors={errors}
                required
              />
            </Col>
          </Row>
        )}

        <SelectField
          name="day_preset"
          label="Day Presets"
          placeholder="Select day preset..."
          options={DAY_PRESET_OPTIONS_LIST}
          control={control}
          errors={errors}
        />

        <Form.Group>
          <Form.Label>Select Days</Form.Label>
          <div className="d-flex flex-wrap gap-3">
            {DAYS.map(({ key, label }) => (
              <Controller<AddFeeFormData>
                key={key}
                name={key}
                control={control}
                render={({ field }) => (
                  <Form.Check
                    type="checkbox"
                    id={key}
                    label={label}
                    checked={!!field.value}
                    onChange={(e) => field.onChange(e.target.checked)}
                  />
                )}
              />
            ))}
          </div>
          {errors.monday_ind && (
            <div className="text-danger mt-2">{errors.monday_ind.message}</div>
          )}
        </Form.Group>

        <hr className="gap-0 m-0" />

        <Row className="gy-3">
          <Col xs={12} md={6}>
            <SelectField
              name="recreation_fee_code"
              label="Fee Type"
              options={feeTypeOptions}
              placeholder="Select fee type..."
              control={control}
              errors={errors}
              disabled={optionsLoading}
            />
          </Col>
          <Col xs={12} md={6}>
            <CurrencyInputField
              name="fee_amount"
              label="Amount"
              control={control}
              errors={errors}
              required
            />
          </Col>
        </Row>

        <Row className="gy-3">
          <Col xs={12} className="d-flex justify-content-end">
            <Button
              variant="primary"
              type="submit"
              disabled={!isDirty || mutation.isPending || optionsLoading}
            >
              {submitLabel}
            </Button>
          </Col>
        </Row>
      </Stack>
    </Form>
  );
};

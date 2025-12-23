import {
  CurrencyInputField,
  DateInputField,
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
  FEE_APPLIES_DROPDOWN_OPTIONS,
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

  return (
    <Form onSubmit={handleSubmit(onSubmit)}>
      <Stack direction="vertical" gap={4}>
        <SelectField
          name="fee_applies"
          label="Fee Applies"
          placeholder="Select when fee applies..."
          options={FEE_APPLIES_DROPDOWN_OPTIONS}
          control={control}
          errors={errors}
        />

        {feeApplies === FEE_APPLIES_OPTIONS.SPECIFIC_DATES && (
          <>
            <Row className="gy-3">
              <Col xs={12} md={6}>
                <DateInputField
                  name="fee_start_date"
                  label="Start Date"
                  control={control}
                  errors={errors}
                />
              </Col>
              <Col xs={12} md={6}>
                <DateInputField
                  name="fee_end_date"
                  label="End Date"
                  control={control}
                  errors={errors}
                />
              </Col>
            </Row>
          </>
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

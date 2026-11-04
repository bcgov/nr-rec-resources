import { Controller } from 'react-hook-form';
import { Form } from 'react-bootstrap';
import { QuillEditor } from './QuillEditor';
import { getPlainTextLength } from './helpers';
import './RichTextEditor.scss';
import { HelpIcon } from '@/components';

export interface RichTextEditorProps {
  name: string;
  label?: string;
  control: any;
  errors?: any;
  required?: boolean;
  helpText?: string;
  helperText?: string;
  /** Pass a module-level constant, not an inline array. */
  toolbarOptions?: unknown[];
  /** Shows a counter against the plain text length when set. */
  maxLength?: number;
}

export const RichTextEditor = ({
  name,
  label,
  control,
  errors = {},
  required = false,
  helpText,
  helperText,
  toolbarOptions,
  maxLength,
}: RichTextEditorProps) => {
  return (
    <Form.Group controlId={name}>
      {label && (
        <Form.Label className="d-flex align-items-center flex-wrap gap-1">
          {label}
          {required ? ' *' : ''}
          {helpText && <HelpIcon id={`${name}-help`} text={helpText} />}
        </Form.Label>
      )}

      <Controller
        name={name}
        control={control}
        render={({ field }) => {
          const length = getPlainTextLength(field.value || '');

          return (
            <>
              <QuillEditor
                value={field.value || ''}
                onChange={field.onChange}
                toolbarOptions={toolbarOptions}
              />

              {errors[name] && (
                <Form.Control.Feedback type="invalid" className="d-block">
                  {errors[name].message}
                </Form.Control.Feedback>
              )}

              <div className="d-flex justify-content-between gap-3">
                {helperText ? (
                  <Form.Text muted>{helperText}</Form.Text>
                ) : (
                  <span />
                )}
                {maxLength ? (
                  <Form.Text
                    muted={length <= maxLength}
                    className={length > maxLength ? 'text-danger' : undefined}
                  >
                    {length} / {maxLength}
                  </Form.Text>
                ) : null}
              </div>
            </>
          );
        }}
      />
    </Form.Group>
  );
};

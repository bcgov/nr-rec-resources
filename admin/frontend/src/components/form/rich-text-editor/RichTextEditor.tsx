import { Controller } from 'react-hook-form';
import { Form } from 'react-bootstrap';
import { QuillEditor } from './QuillEditor';
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
}

export const RichTextEditor = ({
  name,
  label,
  control,
  errors = {},
  required = false,
  helpText,
  helperText,
}: RichTextEditorProps) => {
  return (
    <Form.Group controlId={name}>
      {label && (
        <Form.Label>
          {label}
          {required ? ' *' : ''}
          {helpText && <HelpIcon id={`${name}-help`} text={helpText} />}
        </Form.Label>
      )}

      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <>
            <QuillEditor value={field.value || ''} onChange={field.onChange} />

            {errors[name] && (
              <Form.Control.Feedback type="invalid" className="d-block">
                {errors[name].message}
              </Form.Control.Feedback>
            )}
          </>
        )}
      />
      {helperText && <Form.Text muted>{helperText}</Form.Text>}
    </Form.Group>
  );
};

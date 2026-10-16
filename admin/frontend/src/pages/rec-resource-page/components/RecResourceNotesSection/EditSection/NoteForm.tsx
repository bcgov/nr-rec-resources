import { faCalendar, faUser } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, Col, Form, InputGroup, Row, Stack } from 'react-bootstrap';
import { RichTextEditor } from '@/components/form';
import { RecreationNoteDto } from '@/services/recreation-resource-admin';
import {
  NOTE_BODY_HELPER_TEXT,
  NOTE_BODY_MAX_LENGTH,
  NOTE_TITLE_HELPER_TEXT,
  NOTE_TITLE_MAX_LENGTH,
  NOTE_TOOLBAR_OPTIONS,
} from './constants';
import { NoteFormMode, useNoteForm } from './hooks/useNoteForm';
import './NoteForm.scss';

export const NoteForm = ({
  recResourceId,
  mode,
  initialNote,
  onDone,
  onCancel,
  onDelete,
}: {
  recResourceId: string;
  mode: NoteFormMode;
  initialNote?: RecreationNoteDto;
  onDone?: () => void;
  onCancel: () => void;
  onDelete?: () => void;
}) => {
  const {
    control,
    register,
    errors,
    watch,
    onSubmit,
    mutation,
    createdBy,
    dateLogged,
    isSubmittable,
  } = useNoteForm({ recResourceId, mode, initialNote, onDone });

  const titleLength = (watch('title') ?? '').length;

  const submitLabel = (() => {
    if (mutation.isPending) return 'Saving...';
    return mode === 'create' ? 'Save note' : 'Update note';
  })();

  return (
    <Form onSubmit={onSubmit} noValidate className="note-form">
      <Stack direction="vertical" gap={3}>
        {/* Stamped by the server, shown here for context. */}
        <Row className="gy-3">
          <Col xs={12} md={6}>
            <Form.Group controlId="note-created-by">
              <Form.Label>Created by</Form.Label>
              <InputGroup>
                <InputGroup.Text>
                  <FontAwesomeIcon icon={faUser} aria-hidden="true" />
                </InputGroup.Text>
                <Form.Control value={createdBy} disabled readOnly />
              </InputGroup>
            </Form.Group>
          </Col>
          <Col xs={12} md={6}>
            <Form.Group controlId="note-date-logged">
              <Form.Label>Date logged</Form.Label>
              <InputGroup>
                <InputGroup.Text>
                  <FontAwesomeIcon icon={faCalendar} aria-hidden="true" />
                </InputGroup.Text>
                <Form.Control value={dateLogged} disabled readOnly />
              </InputGroup>
            </Form.Group>
          </Col>
        </Row>

        <Form.Group controlId="note-title">
          <Form.Label>Title (required)</Form.Label>
          <Form.Control
            {...register('title')}
            maxLength={NOTE_TITLE_MAX_LENGTH}
            isInvalid={Boolean(errors.title)}
          />
          <Form.Control.Feedback type="invalid">
            {errors.title?.message}
          </Form.Control.Feedback>
          <div className="d-flex justify-content-between gap-3">
            <Form.Text muted>{NOTE_TITLE_HELPER_TEXT}</Form.Text>
            <Form.Text muted className="text-nowrap">
              {titleLength} / {NOTE_TITLE_MAX_LENGTH}
            </Form.Text>
          </div>
        </Form.Group>

        <RichTextEditor
          name="body"
          label="Body (required)"
          control={control}
          errors={errors}
          toolbarOptions={NOTE_TOOLBAR_OPTIONS}
          maxLength={NOTE_BODY_MAX_LENGTH}
          helperText={NOTE_BODY_HELPER_TEXT}
        />

        <div className="note-form__actions">
          {onDelete ? (
            <Button
              variant="outline-primary"
              onClick={onDelete}
              disabled={mutation.isPending}
            >
              Delete
            </Button>
          ) : null}
          <Stack
            direction="horizontal"
            gap={2}
            className="note-form__actions-end"
          >
            <Button
              variant="outline-primary"
              onClick={onCancel}
              disabled={mutation.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={!isSubmittable}>
              {submitLabel}
            </Button>
          </Stack>
        </div>
      </Stack>
    </Form>
  );
};

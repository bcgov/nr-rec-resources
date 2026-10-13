import { faCalendar, faUser } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, Card, Stack } from 'react-bootstrap';
import { CustomBadge } from '@/components/custom-badge';
import { EditableGuard } from '@/components/auth';
import { COLOR_BLACK, COLOR_WHITE } from '@/styles/colors';
import { RecreationResourceNoteUIModel } from '@/services/mocks/recreationResourceNotes';
import { SafeHtml } from '@shared/components/safe-html';
import { formatDateFull } from '@shared/utils';
import { NOTE_TYPE_LABELS } from './constants';
import './RecResourceNotesSection.scss';

type NoteCardProps = {
  note: RecreationResourceNoteUIModel;
  isArchived?: boolean;
  onRemove: (note: RecreationResourceNoteUIModel) => void;
};

export const NoteCard = ({ note, isArchived, onRemove }: NoteCardProps) => {
  return (
    <Card className="border notes-card">
      <Card.Body className="py-3">
        <Stack direction="horizontal" gap={3} className="align-items-start">
          <Stack direction="vertical" gap={2} className="flex-grow-1">
            <h3 className="fs-5 fw-bold mb-0">{note.title}</h3>

            <SafeHtml html={note.body} className="notes-card-body" />

            <div>
              <CustomBadge
                label={NOTE_TYPE_LABELS[note.note_type]}
                bgColor={COLOR_BLACK}
                textColor={COLOR_WHITE}
                fontWeight={700}
              />
            </div>

            <Stack direction="horizontal" gap={5} className="flex-wrap">
              <Stack direction="horizontal" gap={2}>
                <FontAwesomeIcon icon={faCalendar} aria-hidden="true" />
                <span>
                  <span className="fw-semibold me-2">Date logged</span>
                  {formatDateFull(note.date_logged) ?? '-'}
                </span>
              </Stack>
              <Stack direction="horizontal" gap={2}>
                <FontAwesomeIcon icon={faUser} aria-hidden="true" />
                <span>
                  <span className="fw-semibold me-2">Created by</span>
                  {note.created_by}
                </span>
              </Stack>
            </Stack>
          </Stack>

          <EditableGuard isArchived={isArchived}>
            <Button
              variant="outline-primary"
              size="sm"
              className="flex-shrink-0"
              onClick={() => onRemove(note)}
              aria-label={`Remove note ${note.title}`}
            >
              Remove
            </Button>
          </EditableGuard>
        </Stack>
      </Card.Body>
    </Card>
  );
};

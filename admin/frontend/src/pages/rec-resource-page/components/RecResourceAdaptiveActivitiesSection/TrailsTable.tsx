import { CustomBadge, Table } from '@/components';
import { useAuthorizations } from '@/hooks/useAuthorizations';
import { useDeleteTrail } from '@/services';
import { RecreationTrailDto } from '@/services/recreation-resource-admin/models';
import { faPen, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useState } from 'react';
import { Button } from 'react-bootstrap';
import { TrailFormModal } from './TrailFormModal';

const TRAIL_TYPE_BADGE: Record<string, { label: string; color: string }> = {
  GREEN: { label: 'Green', color: '#2d7a27' },
  BLUE: { label: 'Blue', color: '#1a5fa8' },
  BLACK: { label: 'Black', color: '#111111' },
};

export const TrailsTable = ({
  recResourceId,
  activityCode,
  trails,
}: {
  recResourceId: string;
  activityCode: number;
  trails: RecreationTrailDto[];
}) => {
  const { canEdit } = useAuthorizations();
  const deleteTrail = useDeleteTrail();
  const [editingTrail, setEditingTrail] = useState<RecreationTrailDto | null>(
    null,
  );
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const handleDelete = async (trail: RecreationTrailDto) => {
    if (deletingId === trail.recreation_activity_code_trails_id) {
      await deleteTrail.mutateAsync({
        recResourceId,
        trailId: trail.recreation_activity_code_trails_id,
      });
      setDeletingId(null);
    } else {
      setDeletingId(trail.recreation_activity_code_trails_id);
    }
  };

  const columns = [
    {
      header: 'Trail name',
      render: (trail: RecreationTrailDto) => trail.name,
    },
    {
      header: 'Difficulty',
      render: (trail: RecreationTrailDto) => {
        if (!trail.trail_type) {
          return (
            <div className="text-center">
              <span className="text-secondary">—</span>
            </div>
          );
        }
        const badge = TRAIL_TYPE_BADGE[trail.trail_type] ?? {
          label: trail.trail_type,
          color: '#555',
        };
        return (
          <div className="text-center">
            <CustomBadge
              label={badge.label}
              bgColor={badge.color}
              textColor="#ffffff"
              borderColor={badge.color}
              fontWeight="bold"
            />
          </div>
        );
      },
    },
    {
      header: 'Description',
      render: (trail: RecreationTrailDto) => (
        <span className="text-secondary small">{trail.description || '—'}</span>
      ),
    },
    ...(canEdit
      ? [
          {
            header: 'Actions',
            render: (trail: RecreationTrailDto) => {
              const isConfirming =
                deletingId === trail.recreation_activity_code_trails_id;
              return (
                <div className="d-flex align-items-center gap-2">
                  <button
                    type="button"
                    className="p-0 border-0 bg-transparent bc-color-blue-dk"
                    aria-label="Edit trail"
                    title="Edit trail"
                    onClick={() => setEditingTrail(trail)}
                  >
                    <FontAwesomeIcon icon={faPen} />
                  </button>
                  {isConfirming ? (
                    <div className="d-flex align-items-center gap-1">
                      <span className="small text-danger">Delete?</span>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => void handleDelete(trail)}
                        disabled={deleteTrail.isPending}
                      >
                        Yes
                      </Button>
                      <Button
                        size="sm"
                        variant="outline-secondary"
                        onClick={() => setDeletingId(null)}
                      >
                        No
                      </Button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      className="p-0 border-0 bg-transparent text-danger"
                      aria-label="Delete trail"
                      title="Delete trail"
                      onClick={() => void handleDelete(trail)}
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  )}
                </div>
              );
            },
          },
        ]
      : []),
  ];

  return (
    <>
      <Table
        columns={columns}
        rows={trails}
        getRowKey={(trail) => String(trail.recreation_activity_code_trails_id)}
        emptyMessage="No trails added yet"
      />

      {editingTrail && (
        <TrailFormModal
          recResourceId={recResourceId}
          activityCode={activityCode}
          mode="edit"
          initialTrail={editingTrail}
          onClose={() => setEditingTrail(null)}
        />
      )}
    </>
  );
};

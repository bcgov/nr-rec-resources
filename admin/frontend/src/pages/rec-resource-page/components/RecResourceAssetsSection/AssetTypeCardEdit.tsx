import { ReactNode } from 'react';
import { AssetTypeCard } from './AssetTypeCard';

interface AssetTypeCardEditProps {
  eventKey: string;
  description: string;
  count: number;
  totalValue: number;
  activeRepairsCount: number;
  children?: ReactNode;
  onCancel: () => void;
  onSave: () => void;
  isSaving?: boolean;
}

/**
 * Thin wrapper around AssetTypeCard that always renders in editing mode.
 * Keeping this component maintains backward compatibility with existing call sites.
 */
export function AssetTypeCardEdit({
  eventKey,
  description,
  count,
  totalValue,
  activeRepairsCount,
  children,
  onCancel,
  onSave,
  isSaving = false,
}: AssetTypeCardEditProps) {
  return (
    <AssetTypeCard
      eventKey={eventKey}
      description={description}
      count={count}
      totalValue={totalValue}
      activeRepairsCount={activeRepairsCount}
      isEditing={true}
      isSaving={isSaving}
      onCancel={onCancel}
      onSave={onSave}
    >
      {children}
    </AssetTypeCard>
  );
}

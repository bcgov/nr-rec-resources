import { BlueStatusIcon, RedStatusIcon, YellowStatusIcon } from './StatusIcons';

const YELLOW_GROUPLABELS = new Set([
  'seasonal restrictions',
  'visit with caution',
  'limited access',
]);
const RED_GROUPLABELS = new Set(['closed', 'restricted']);

export function getStatusIcon(grouplabel?: string | null): React.ReactElement {
  if (!grouplabel) return <BlueStatusIcon />;
  const lower = grouplabel.toLowerCase();
  if (RED_GROUPLABELS.has(lower)) return <RedStatusIcon />;
  if (YELLOW_GROUPLABELS.has(lower)) return <YellowStatusIcon />;
  return <BlueStatusIcon />;
}

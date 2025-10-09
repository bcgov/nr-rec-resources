import { IconButton } from '@shared/components/icon-button';
import DownloadIcon from '@shared/assets/icons/download.svg';

const DOWNLOAD_ICON_CONFIG = {
  WIDTH: 16,
  HEIGHT: 16,
  ALT: 'Download map',
} as const;

interface ExportMapFileBtnProps {
  onClick: () => void;
}

export const ExportMapFileBtn = ({ onClick }: ExportMapFileBtnProps) => {
  return (
    <IconButton
      variant="outline"
      onClick={onClick}
      aria-label="Export map file"
      leftIcon={
        <img
          src={DownloadIcon}
          alt={DOWNLOAD_ICON_CONFIG.ALT}
          width={DOWNLOAD_ICON_CONFIG.WIDTH}
          height={DOWNLOAD_ICON_CONFIG.HEIGHT}
        />
      }
    >
      Export map file
    </IconButton>
  );
};

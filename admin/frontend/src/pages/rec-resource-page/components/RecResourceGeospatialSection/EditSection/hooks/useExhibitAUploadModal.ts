import { useCallback, useState } from 'react';
import { GalleryFile } from '@/pages/rec-resource-page/types';

export interface ExhibitAUploadModalState {
  show: boolean;
  file: GalleryFile | null;
  fileName: string;
  fileNameError: string;
}

const INITIAL_STATE: ExhibitAUploadModalState = {
  show: false,
  file: null,
  fileName: '',
  fileNameError: '',
};

/** State for the "name this file" modal shown after a PDF is picked. */
export const useExhibitAUploadModal = () => {
  const [state, setState] = useState<ExhibitAUploadModalState>(INITIAL_STATE);

  const selectFile = useCallback((file: File) => {
    const extension = file.name.split('.').pop() || 'pdf';
    const galleryFile: GalleryFile = {
      id: crypto.randomUUID(),
      name: file.name.replace(/\.[^/.]+$/, ''),
      date: '',
      url: '',
      extension,
      type: 'document',
      pendingFile: file,
    };

    setState({
      show: true,
      file: galleryFile,
      fileName: galleryFile.name,
      fileNameError: '',
    });
  }, []);

  const setFileName = useCallback((fileName: string) => {
    setState((prev) => ({ ...prev, fileName, fileNameError: '' }));
  }, []);

  const hide = useCallback(() => {
    setState((prev) => ({ ...prev, show: false }));
  }, []);

  return { state, selectFile, setFileName, hide } as const;
};

import { GalleryFile } from '../../types';

export function validateUploadFile(
  recResourceId: string | undefined,
  file: GalleryFile,
  requiredFields: string[] = ['pendingFile', 'name'],
): boolean {
  if (!recResourceId) {
    return false;
  }

  for (const field of requiredFields) {
    if (field === 'pendingFile' && !file.pendingFile) {
      return false;
    }
    if (field === 'name' && !file.name) {
      return false;
    }
  }

  return true;
}

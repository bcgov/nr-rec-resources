// Types and interfaces for DAM API
export interface DamResource {
  ref_id: string;
  files: DamFile[];
}

export interface DamFile {
  size_code: string;
  path: string;
  url?: string;
  width?: number;
  height?: number;
  file_size?: number;
}

export interface DamCreateResourceRequest {
  title: string;
  resourceType: "pdf" | "image";
}

export interface DamUploadFileRequest {
  ref: string;
  file: Express.Multer.File;
}

export interface DamCollectionRequest {
  resource: string;
  collectionType: "pdf" | "image";
}

export interface DamApiConfig {
  damUrl: string;
  privateKey: string;
  user: string;
  pdfCollectionId: string;
  imageCollectionId: string;
  pdfResourceType: number;
  imageResourceType: number;
}

export enum DamErrors {
  ERR_CREATING_RESOURCE = 416,
  ERR_GETTING_RESOURCE_IMAGES = 417,
  ERR_ADDING_RESOURCE_TO_COLLECTION = 418,
  ERR_UPLOADING_FILE = 419,
  ERR_DELETING_RESOURCE = 420,
  ERR_SERVICE_UNAVAILABLE = 421,
  ERR_INVALID_CONFIGURATION = 422,
  ERR_FILE_PROCESSING_TIMEOUT = 423,
}

export const DAM_CONFIG = {
  HTTP_TIMEOUT: 15 * 60 * 1000,
  IMAGE_VALIDATION_TIMEOUT: 5 * 60 * 1000,
  RETRY_ATTEMPTS: 5,
  REQUIRED_SIZE_CODES: ["original", "thm", "col", "pre"] as const,
} as const;

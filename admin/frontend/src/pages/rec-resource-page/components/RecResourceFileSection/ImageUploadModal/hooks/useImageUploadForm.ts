import { zodResolver } from '@hookform/resolvers/zod';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import {
  createImageUploadSchema,
  ImageUploadFormData,
  isDateSuspiciouslyOld,
  MAX_DISPLAY_NAME_LENGTH,
} from '@/pages/rec-resource-page/components/RecResourceFileSection/ImageUploadModal/schemas';
import {
  setUploadFileName,
  setUploadConsentData,
} from '@/pages/rec-resource-page/store/recResourceFileTransferStore';

interface UseImageUploadFormOptions {
  initialValues?: Partial<ImageUploadFormData>;
  syncToUploadStore?: boolean;
  disableConsentFields?: boolean;
}

export const useImageUploadForm = (
  initialDisplayName?: string,
  options: UseImageUploadFormOptions = {},
) => {
  const {
    initialValues,
    syncToUploadStore = true,
    disableConsentFields = false,
  } = options;
  const [consentFormFile, setConsentFormFile] = useState<File | null>(null);

  const displayNameWithoutExtension = initialDisplayName?.replace(
    /\.[^/.]+$/,
    '',
  );

  const defaultValues = useMemo(
    () => ({
      displayName: displayNameWithoutExtension?.slice(
        0,
        MAX_DISPLAY_NAME_LENGTH,
      ),
      dateCreated: null,
      didYouTakePhoto: null,
      containsIdentifiableInfo: null,
      photographerName: '',
      photographerType: 'STAFF',
      consentFormFile: null,
      confirmationChecked: false,
      ...initialValues,
    }),
    [displayNameWithoutExtension, initialValues],
  );
  const defaultValuesRef = useRef(defaultValues);

  useEffect(() => {
    defaultValuesRef.current = defaultValues;
  }, [defaultValues]);

  const form = useForm<ImageUploadFormData>({
    resolver: zodResolver(
      createImageUploadSchema({
        disableConsentFields,
      }),
    ),
    defaultValues,
    mode: 'onChange',
  });

  const { setValue, reset, control } = form;

  // Update display name when initial name changes
  useEffect(() => {
    if (!syncToUploadStore) return;
    if (displayNameWithoutExtension) {
      const defaultDisplayName = displayNameWithoutExtension.slice(
        0,
        MAX_DISPLAY_NAME_LENGTH,
      );
      setValue('displayName', defaultDisplayName);
      setUploadFileName(defaultDisplayName);
    }
  }, [displayNameWithoutExtension, setValue, syncToUploadStore]);

  // Sync consent form file to form state
  useEffect(() => {
    setValue('consentFormFile', consentFormFile, { shouldValidate: true });
  }, [consentFormFile, setValue]);

  const dateCreated = useWatch({ control, name: 'dateCreated' });
  const didYouTakePhoto = useWatch({ control, name: 'didYouTakePhoto' });
  const containsIdentifiableInfo = useWatch({
    control,
    name: 'containsIdentifiableInfo',
  });
  const photographerType = useWatch({ control, name: 'photographerType' });
  const photographerName = useWatch({ control, name: 'photographerName' });

  // Sync consent metadata to store whenever relevant values change
  useEffect(() => {
    if (!syncToUploadStore) return;
    setUploadConsentData({
      dateTaken: dateCreated?.toISOString().split('T')[0] ?? null,
      containsPii: containsIdentifiableInfo ?? false,
      photographerType: photographerType ?? 'STAFF',
      photographerName: photographerName ?? '',
      consentFormFile: consentFormFile,
    });
  }, [
    dateCreated,
    containsIdentifiableInfo,
    photographerType,
    photographerName,
    consentFormFile,
    syncToUploadStore,
  ]);

  // Check if date is suspiciously old for warning display
  const showDateWarning = isDateSuspiciouslyOld(dateCreated);

  // Conditional field visibility based on photographer type
  const isStaff = photographerType === 'STAFF';

  // "Was this taken by staff during regular duties?" only shows for staff
  const showTakenDuringWorkingHours = isStaff;

  // Name field for non-staff — disabled while non-staff uploads are not accepted
  const showNameField = false; // !isStaff

  // Not accepted: show warning when not staff, or staff answers "No"
  const showNotAcceptedAlert =
    !isStaff || (isStaff && didYouTakePhoto === false);

  // Consent form needed when PII is present and not blocked by non-staff alert
  const showConsentUpload =
    !showNotAcceptedAlert && containsIdentifiableInfo === true;

  // Handle consent form PDF upload
  const handleConsentFileSelect = useCallback((file: File | null) => {
    setConsentFormFile(file);
  }, []);

  // Handle consent form removal
  const handleConsentFileRemove = useCallback(() => {
    setConsentFormFile(null);
    setValue('consentFormFile', null);
  }, [setValue]);

  const resetForm = () => {
    reset(defaultValuesRef.current);
    setConsentFormFile(null);
    if (syncToUploadStore) {
      setUploadFileName(displayNameWithoutExtension ?? '');
    }
  };

  const isUploadEnabled = form.formState.isValid;
  const isFormDirty = form.formState.isDirty;

  return {
    control: form.control,
    handleSubmit: form.handleSubmit,
    errors: form.formState.errors,
    setValue: form.setValue,
    resetForm,
    isUploadEnabled,
    isFormDirty,
    isStaff,
    showDateWarning,
    showTakenDuringWorkingHours,
    showNameField,
    showNotAcceptedAlert,
    showConsentUpload,
    consentFormFile,
    handleConsentFileSelect,
    handleConsentFileRemove,
  };
};

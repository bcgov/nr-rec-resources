import type { UseFormGetValues, RegisterOptions } from 'react-hook-form';
import {
  validateLatitude,
  validateLongitude,
} from '@/utils/coordinateValidation';
import type { AssetEditFormValues } from './AssetCardEdit';

/**
 * Returns react-hook-form register options for the longitude field.
 * Delegates range/format validation to the shared validateLongitude util.
 * Cross-validates against latitude: longitude is required when latitude is set.
 */
export function longitudeRegisterOptions(
  getValues: UseFormGetValues<AssetEditFormValues>,
): RegisterOptions<AssetEditFormValues, 'longitude'> {
  return {
    validate: (val) => {
      const rangeError = validateLongitude(val);
      if (rangeError) return rangeError;
      const lat = getValues('latitude');
      if (lat !== '' && val === '')
        return 'Longitude is required when latitude is set';
      return true;
    },
  };
}

/**
 * Returns react-hook-form register options for the latitude field.
 * Delegates range/format validation to the shared validateLatitude util.
 * Cross-validates against longitude: latitude is required when longitude is set.
 */
export function latitudeRegisterOptions(
  getValues: UseFormGetValues<AssetEditFormValues>,
): RegisterOptions<AssetEditFormValues, 'latitude'> {
  return {
    validate: (val) => {
      const rangeError = validateLatitude(val);
      if (rangeError) return rangeError;
      const lng = getValues('longitude');
      if (lng !== '' && val === '')
        return 'Latitude is required when longitude is set';
      return true;
    },
  };
}

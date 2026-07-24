import { z } from 'zod';

export const createEditResourceGeospatialSchema = () =>
  z.object({
    // Computed/read-only fields are displayed in the UI but are not included in the editable schema.

    // UTM zone: integer 1-60 (BC uses zones 7-11)
    utm_zone: z
      .number()
      .int({ message: 'UTM zone must be an integer' })
      .min(1, { message: 'UTM zone must be between 1 and 60' })
      .max(60, { message: 'UTM zone must be between 1 and 60' }),

    // UTM easting: valid range for a UTM zone (100 000 – 999 999 m)
    utm_easting: z
      .number()
      .refine((val) => Number.isFinite(val), {
        message: 'UTM easting must be a finite number',
      })
      .refine((val) => val >= 100_000 && val <= 999_999, {
        message: 'UTM easting must be between 100 000 and 999 999',
      }),

    // UTM northing: valid range for northern hemisphere (0 – 9 999 999 m)
    utm_northing: z
      .number()
      .refine((val) => Number.isFinite(val), {
        message: 'UTM northing must be a finite number',
      })
      .refine((val) => val >= 0 && val <= 9_999_999, {
        message: 'UTM northing must be between 0 and 9 999 999',
      }),
  });

export type EditResourceGeospatialFormData = z.infer<
  ReturnType<typeof createEditResourceGeospatialSchema>
>;

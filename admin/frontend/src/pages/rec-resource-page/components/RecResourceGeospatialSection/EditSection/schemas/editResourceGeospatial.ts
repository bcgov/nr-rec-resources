import { z } from 'zod';

export const createEditResourceGeospatialSchema = () =>
  z.object({
    // Computed/read-only fields are displayed in the UI but are not included in the editable schema.

    // UTM zone: required integer
    utm_zone: z.number().int({ message: 'UTM zone must be an integer' }),

    // UTM easting: required finite number
    utm_easting: z.number().refine((val) => Number.isFinite(val), {
      message: 'UTM easting must be a finite number',
    }),

    // UTM northing: required finite number
    utm_northing: z.number().refine((val) => Number.isFinite(val), {
      message: 'UTM northing must be a finite number',
    }),
  });

export type EditResourceGeospatialFormData = z.infer<
  ReturnType<typeof createEditResourceGeospatialSchema>
>;

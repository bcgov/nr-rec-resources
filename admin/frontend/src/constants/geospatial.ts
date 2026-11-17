export const SITE_TYPE_CODES = ['IF', 'RR', 'SIT', 'RTR', 'TRB'];
export const TRAIL_TYPE_CODES = ['TBL', 'IFT', 'RTE'];

export const GEOMETRY_NUMBER_FORMAT: Intl.NumberFormatOptions = {
  minimumFractionDigits: 2,
  maximumFractionDigits: 4,
};

export const UTM_HELP = {
  zone: 'The UTM zone indicates which of the Universal Transverse Mercator Zones the Recreation Resource falls within. All UTM data is validated to ensure it is within British Columbia.',
  easting:
    'The horizontal distance measured east of the central meridian of a specific UTM zone.',
  northing:
    'The vertical distance measured north of the central meridian of a specific UTM zone.',
};

/**
 * Access options are stored in the form as `<access code>|<sub access code>` strings,
 * matching the composite ids the fee type field uses. The sub access code is empty for
 * an access type recorded without one, which the API accepts as an empty sub_access_codes.
 */

const SEPARATOR = '|';

export const buildAccessOptionValue = (
  accessCode: string,
  subAccessCode = '',
) => `${accessCode}${SEPARATOR}${subAccessCode}`;

export const parseAccessOptionValue = (optionValue: string) => {
  const [accessCode = '', subAccessCode = ''] = optionValue.split(SEPARATOR);

  return { accessCode, subAccessCode };
};

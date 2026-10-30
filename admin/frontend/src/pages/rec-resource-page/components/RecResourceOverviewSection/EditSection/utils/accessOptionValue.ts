/**
 * Access options are stored in the form as `<access code>|<sub access code>` strings,
 * matching the composite ids the fee type field uses, so the access code the sub-access
 * belongs to survives in form state.
 */

const SEPARATOR = '|';

export const buildAccessOptionValue = (
  accessCode: string,
  subAccessCode: string,
) => `${accessCode}${SEPARATOR}${subAccessCode}`;

export const parseAccessOptionValue = (optionValue: string) => {
  const [accessCode = '', subAccessCode = ''] = optionValue.split(SEPARATOR);

  return { accessCode, subAccessCode };
};

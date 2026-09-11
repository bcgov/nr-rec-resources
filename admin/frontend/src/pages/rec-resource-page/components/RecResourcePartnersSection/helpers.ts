export const formatPhoneNumber = (value: string): string => {
  const digits = value.replace(/\D/g, '');
  return digits.replace(/^(\d{3})(\d{3})(\d{4})$/, '$1-$2-$3');
};

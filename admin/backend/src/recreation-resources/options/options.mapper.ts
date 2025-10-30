import { OptionDto } from '@/recreation-resources/options';

/**
 * Map DB records for access/sub-access codes into OptionDto structures.
 * Kept generic and pure for easy testing.
 */
export function mapAccessOptions(records: any[]): OptionDto[] {
  const accessCodeMap = new Map<
    string,
    {
      id: string;
      label: string;
      children: OptionDto[];
    }
  >();

  for (const record of records) {
    const accessCode = record.access_code;
    if (!accessCodeMap.has(accessCode)) {
      accessCodeMap.set(accessCode, {
        id: accessCode,
        label: record.access_code_description,
        children: [],
      });
    }
    if (record.sub_access_code) {
      accessCodeMap.get(accessCode)!.children.push({
        id: record.sub_access_code,
        label: record.sub_access_code_description,
      });
    }
  }

  return Array.from(accessCodeMap.values());
}

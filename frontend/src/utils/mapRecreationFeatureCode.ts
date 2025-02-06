enum RecreationFeatureCode {
  RTR = 'Recreation Trail',
  SIT = 'Recreation Site',
  RR = 'Recreation Reserve',
  IF = 'Interpretive Forest',
}

const recreationFeatureMap = new Map<string, string>(
  Object.entries(RecreationFeatureCode),
);

export const mapRecreationFeatureCode = (code: string): string => {
  return recreationFeatureMap.get(code) ?? 'Unknown Feature';
};

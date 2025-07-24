export interface EnvironmentConfig {
  account: string;
  region: string;
  stageTagName: string;
  notificationEmails: string[];
}

interface Config {
  [key: string]: EnvironmentConfig;
}

const REGION = "ca-central-1";

export const config: Config = {
  dev: {
    stageTagName: "Dev",
    account: "881490129697",
    region: REGION,
    notificationEmails: [
      "ParksandRecDigitalService@gov.bc.ca",
      "jimmy.palelil@gov.bc.ca",
      "Felipe.Barreta@gov.bc.ca",
      "Marcel.1.Mueller@gov.bc.ca",
    ],
  },
  prod: {
    stageTagName: "Prod",
    account: "682033465909",
    region: REGION,
    notificationEmails: [
      "ParksandRecDigitalService@gov.bc.ca",
      "jimmy.palelil@gov.bc.ca",
      "Felipe.Barreta@gov.bc.ca",
      "Marcel.1.Mueller@gov.bc.ca",
    ],
  },
};

export function getEnvConfigForStage(stage: string): EnvironmentConfig {
  const envConfig = config[stage];
  if (!envConfig) {
    throw new Error(`No configuration found for stage: ${stage}`);
  }
  return envConfig;
}

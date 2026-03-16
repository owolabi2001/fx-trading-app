export const MCBaseRequestPattern = 'mission.service';

export const getMissionControlPattern = (pattern: string) => {
  return `${MCBaseRequestPattern}:${pattern}`;
};

export enum MissionControlPatterns {
  getFee = 'getFee',
  businessOnboardingAlert = 'businessOnboardingAlert',
}

export const GOGBaseRequestPattern = 'gog.service';

export const getGOGPattern = (pattern: string) => {
  return `${GOGBaseRequestPattern}:${pattern}`;
};

export enum GOGPatterns {
  createUser = 'createUser',
  login = 'login',
  activateAccount = 'activateAccount',
  changePassword = 'changePassword',
  passwordResetRequest = 'passwordResetRequest',
  passwordReset = 'passwordReset',
  getUser = 'getUser',
  resendActivationToken = 'resendActivationToken',
  getUsersProfile = 'getUsersProfile',
  referBusiness = 'referBusiness',
  completeReferral = 'completeReferral',
}

export enum NebulaPatterns {
  profilePicture = 'profilePicture',
  uploadFile = 'uploadFile',
}

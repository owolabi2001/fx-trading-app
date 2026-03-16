export const SignalBasePattern = 'signal.service';

export const getSignalPattern = (pattern: string) => {
  return `${SignalBasePattern}:${pattern}`;
};

export enum SignalPatterns {
  sendBusinessActivationEmail = 'sendBusinessActivationEmail',
  passwordResetEmail = 'passwordResetEmail',
  businessVerificationEmail = 'businessVerificationEmail',
  sendEmail = 'sendEmail',
  sendBulkBusinessPushNotification = 'sendBulkBusinessPushNotification',
  addBusinessToken = 'addBusinessToken',
}

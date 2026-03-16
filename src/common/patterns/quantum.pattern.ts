export const QuantumBaseRequestPattern = 'quantum-transfer.service';

export const getQuantumPattern = (pattern: string) => {
  return `${QuantumBaseRequestPattern}:${pattern}`;
};

export enum QuantumPatterns {
  getBusinessWallet = 'getBusinessWallet',
  fundBusinessWallet = 'fundBusinessWallet',
  queryBankList = 'queryBankList',
  createTransferRecipient = 'createTransferRecipient',
  getTransferRecipient = 'getTransferRecipient',
  weeklyEarning = 'weeklyEarning',
  getBusinessTransactions = 'getBusinessTransactions',
  getBusinessTransaction = 'getBusinessTransaction',
  getWalletInsights = 'getWalletInsights',
}

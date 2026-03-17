export enum ETransactionType {
    CREDIT = 'CREDIT',
    DEBIT = 'DEBIT',
}

export enum ETransactionStatus {
    PENDING = 'PENDING',
    SUCCESS = 'SUCCESS',
    FAILED = 'FAILED',
}

export enum ETransactionPurpose {
    FUNDING = 'FUNDING',
    CONVERSION = 'CONVERSION',
    TRADE = 'TRADE',
}
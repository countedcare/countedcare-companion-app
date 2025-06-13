
export interface CreateSessionBody {
  [key: string]: any;
}

export interface LinkAccountBody {
  sessionId: string;
  accountName: string;
}

export interface SyncTransactionsBody {
  accountId: string;
}

export interface LogDetails {
  [key: string]: any;
}

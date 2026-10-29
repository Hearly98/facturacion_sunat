export type SunatStatus = 'PENDIENTE' | 'ACEPTADA' | 'OBSERVADA' | 'RECHAZADA' | 'ERROR';

export type SunatEnvironment = 'prueba' | 'produccion';

export interface SunatConfig {
  environment: SunatEnvironment;
  autoSend: boolean;
  solUser: string | null;
  hasSolPassword: boolean;
  hasCertificate: boolean;
  certificateExpiresAt: string | null;
}

export interface SunatSendResult {
  status: SunatStatus;
  code: string | null;
  description: string;
  observations: string[];
  number: string;
  hash: string | null;
}

export type CreditNoteReason = '01' | '07';

export interface CreditNoteLine {
  saleDetailId: number;
  code: string;
  name: string;
  unitPrice: number;
  soldQuantity: number;
  returnedQuantity: number;
  availableQuantity: number;
}

export interface CreditNoteBalance {
  canCancel: boolean;
  lines: CreditNoteLine[];
}

export interface CreditNote {
  id: number;
  saleId: number;
  affectedDocument: string | null;
  number: string;
  issueDate: string;
  reasonCode: CreditNoteReason;
  reasonDescription: string;
  total: number;
  sunatStatus: SunatStatus;
  sunatDescription: string | null;
}

export interface CreateCreditNote {
  saleId: number;
  reason: CreditNoteReason;
  items: { saleDetailId: number; quantity: number }[];
}

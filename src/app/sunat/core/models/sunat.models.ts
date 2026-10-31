import { SendingPolicy } from 'src/app/emissions/core/models/emission.models';

export type SunatStatus = 'PENDIENTE' | 'ACEPTADA' | 'OBSERVADA' | 'RECHAZADA' | 'ERROR';

export type SunatEnvironment = 'prueba' | 'produccion';

/** ILEGIBLES: están guardadas pero no se pueden descifrar (cambió APP_KEY); hay que registrarlas de nuevo. */
export type SunatCredentialsStatus = 'OK' | 'ILEGIBLES' | 'INCOMPLETAS';

export interface SunatConfig {
  environment: SunatEnvironment;
  autoSend: boolean;
  solUser: string | null;
  hasSolPassword: boolean;
  hasCertificate: boolean;
  certificateExpiresAt: string | null;
  credentialsStatus: SunatCredentialsStatus;
  credentialsMessage: string | null;
  policy: SendingPolicy;
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
}

export interface CreateCreditNote {
  saleId: number;
  reason: CreditNoteReason;
  items: { saleDetailId: number; quantity: number }[];
}

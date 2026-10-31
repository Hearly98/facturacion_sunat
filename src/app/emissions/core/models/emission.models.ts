export type EmissionFamily = 'boletas' | 'facturas';

export type EmissionStatus =
  | 'PROGRAMADA'
  | 'ESPERANDO_DEPENDENCIA'
  | 'EN_COLA'
  | 'ENVIANDO'
  | 'ACEPTADA'
  | 'OBSERVADA'
  | 'RECHAZADA'
  | 'ERROR';

export interface Emission {
  id: number;
  family: EmissionFamily;
  saleId: number | null;
  documentType: string;
  documentTypeName: string;
  number: string;
  affectedDocument: string | null;
  customer: string;
  total: number;
  status: EmissionStatus;
  issuedAt: string | null;
  scheduledFor: string | null;
  deadline: string | null;
  hoursLeft: number | null;
  attempts: number;
  nextAttemptAt: string | null;
  responseCode: string | null;
  responseDescription: string | null;
}

export interface EmissionAttempt {
  number: number;
  status: EmissionStatus;
  code: string | null;
  description: string | null;
  date: string | null;
}

export interface EmissionDetail extends Emission {
  observations: string[];
  hash: string | null;
  hasXml: boolean;
  hasCdr: boolean;
  history: EmissionAttempt[];
}

export interface EmissionSummary {
  total: number;
  byStatus: Partial<Record<EmissionStatus, number>>;
  pending: number;
  needsAttention: number;
}

export interface EmissionFilters {
  family: EmissionFamily;
  status?: EmissionStatus | '';
  from?: string | null;
  to?: string | null;
  search?: string | null;
  dueSoon?: boolean;
  page?: number;
  perPage?: number;
}

export interface EmissionPage {
  items: Emission[];
  total: number;
  page: number;
  lastPage: number;
}

export type SendingPolicyType = 'INMEDIATO' | 'FIN_DEL_DIA' | 'PROGRAMADO' | 'MANUAL';

export interface SendingPolicy {
  type: SendingPolicyType;
  time: string;
  days: number[];
  safetyMarginHours: number;
  warnings: string[];
}

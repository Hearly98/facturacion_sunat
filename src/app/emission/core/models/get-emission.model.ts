export interface GetEmissionModel {
  id: number;
  documentId: number;
  saleId: number;
  status: 'emitida' | 'error_envio' | 'enviada';
  serieNumber: string;
  correlativeNumber: string;
  pdfUrl: string;
  xmlUrl: string;
  cdrUrl: string;
  errorMessage: string;
  createdAt: string;
  updatedAt: string;
  customerName?: string;
  documentNumber?: string;
  totalAmount?: number;
}

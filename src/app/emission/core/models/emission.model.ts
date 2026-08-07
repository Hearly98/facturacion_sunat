export class EmissionModel {
  id: number = 0;
  documentId: number = 0;
  saleId: number = 0;
  status: 'emitida' | 'error_envio' | 'enviada' = 'emitida';
  serieNumber: string = '';
  correlativeNumber: string = '';
  pdfUrl: string = '';
  xmlUrl: string = '';
  cdrUrl: string = '';
  errorMessage: string = '';
  createdAt: Date = new Date();
  updatedAt: Date = new Date();
}

export interface DocumentDto {
  id: number;
  codigo: string;
  nombre: string;
}

export type CreateDocumentDto = Omit<DocumentDto, 'id'>;
export type UpdateDocumentDto = DocumentDto;

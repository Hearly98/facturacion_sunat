export interface Document {
  id: number;
  code: string;
  name: string;
}

export type CreateDocument = Omit<Document, 'id'>;
export type UpdateDocument = Document;

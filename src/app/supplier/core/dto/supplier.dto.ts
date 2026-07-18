export interface SupplierDto {
  id: number;
  empresaId: number;
  tipoDocumentoId: number | null;
  nombre: string;
  documento: string;
  telefono: string;
  direccion: string;
  email: string;
  banco: string | null;
  cuenta: string | null;
  activo: boolean;
  createdAt: string;
  updatedAt: string;
}

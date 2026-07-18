export interface CreateSupplierDto {
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
}

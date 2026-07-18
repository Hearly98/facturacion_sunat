export interface CustomerDto {
  id: number;
  nombre: string;
  apellido: string;
  razonSocial: string;
  documento: string;
  telefono: string;
  direccion: string;
  email: string;
  codigoUbigeo: string;
  tipoDocumentoId: number;
  empresaId: number;
  departamento: string;
  provincia: string;
  distrito: string;
}

export type CustomerDtoType = CustomerDto;

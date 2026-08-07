export interface CreateCustomerDto {
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
}

export type CreateCustomerDtoType = CreateCustomerDto;

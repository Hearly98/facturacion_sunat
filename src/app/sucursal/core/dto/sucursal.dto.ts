export interface SucursalDto {
  id: number | null;
  empresaId: number;
  nombre: string;
  codigo: string;
  direccion: string;
  ubigeo: string;
  departamento: string;
  provincia: string;
  distrito: string;
}

export interface CreateSucursalDto {
  nombre: string;
  codigo: string;
  direccion: string;
  ubigeo: string;
  departamento: string;
  provincia: string;
  distrito: string;
}

export interface UpdateSucursalDto {
  id: number;
  nombre: string;
  codigo: string;
  direccion: string;
  ubigeo: string;
  departamento: string;
  provincia: string;
  distrito: string;
}

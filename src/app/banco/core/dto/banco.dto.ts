export interface BancoDto {
  id: number | null;
  empresaId: number;
  nombre: string;
  numeroCuenta: string;
  tipoCuenta: string;
  monedaId: number;
  activo: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBancoDto {
  nombre: string;
  numero_cuenta: string;
  tipo_cuenta: string;
  moneda_id: number;
}

export interface UpdateBancoDto {
  nombre: string;
  numero_cuenta: string;
  tipo_cuenta: string;
  moneda_id: number;
}

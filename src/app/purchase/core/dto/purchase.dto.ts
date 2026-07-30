export interface PurchaseDetailProductDto {
  id: number;
  nombre: string;
  codigo_interno: string;
  unidad?: {
    id: number;
    nombre: string;
  };
}

export interface PurchaseDetailDto {
  id: number;
  compra_id: number;
  producto_id: number;
  precio_compra: string;
  cantidad: number;
  total: string;
  producto?: PurchaseDetailProductDto;
}

export interface PurchaseSupplierDto {
  id: number;
  nombre: string;
  documento: string | null;
  telefono: string | null;
  direccion: string | null;
  email: string | null;
  banco: string | null;
  cuenta: string | null;
}

export interface PurchaseCurrencyDto {
  id: number;
  nombre: string;
  simbolo: string;
  codigo: string;
}

export interface PurchaseBranchDto {
  id: number;
  nombre: string;
}

export interface PurchaseUserDto {
  id: number;
  nombre: string;
  apellido: string | null;
}

export interface PurchaseStateDto {
  id: number;
  codigo: string;
  nombre: string;
}

/**
 * Shape actually returned by CompraController (raw Eloquent attributes,
 * snake_case) — verificado contra CompraController::model()/mapEntityToModel(),
 * no asumido. El historial mostraba undefined en todos lados (compr_id,
 * proveedor.prov_nom, estado.estado_cod) porque el frontend nunca tuvo un DTO
 * que reflejara esto, solo `any` crudo.
 */
export interface PurchaseDto {
  id: number;
  empresa_id: number;
  sucursal_id: number;
  usuario_id: number;
  documento_id: number;
  serie_id: number | null;
  proveedor_id: number | null;
  moneda_id: number | null;
  metodo_pago_id: number | null;
  estado_id: number;
  numero: string | null;
  fecha_emision: string | null;
  subtotal: string;
  igv: string;
  total: string;
  monto_acuenta: string;
  monto_pendiente: string;
  comentario: string | null;
  afecta_stock: boolean;
  detalles: PurchaseDetailDto[];
  proveedor?: PurchaseSupplierDto;
  moneda?: PurchaseCurrencyDto;
  sucursal?: PurchaseBranchDto;
  usuario?: PurchaseUserDto;
  estado_compra?: PurchaseStateDto;
}

export interface PurchasePaymentDto {
  id: number;
  compraId: number;
  monto: number;
  fechaPago: string | null;
  metodo: string | null;
  usuarioId: number | null;
  usuarioEmail: string | null;
  usuarioNombre: string | null;
  bancoId: number | null;
  bancoDestino: string | null;
  cuentaDestino: string | null;
  estadoPago: string | null;
  referenciaExterna: string | null;
  observacion: string | null;
  activo: boolean;
  createdAt: string;
  updatedAt: string;
}

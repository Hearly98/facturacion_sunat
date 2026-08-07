export interface QuotationDetailProductDto {
  id: number;
  nombre: string;
  codigo_interno: string;
  peso: string | null;
  unidad?: {
    id: number;
    nombre: string;
  };
}

export interface QuotationDetailDto {
  id: number;
  cotizacion_id: number;
  producto_id: number;
  precio_unitario: string;
  cantidad: number;
  descuento: string;
  total: string;
  descripcion: string | null;
  producto?: QuotationDetailProductDto;
}

export interface QuotationCustomerDto {
  id: number;
  nombre: string;
  apellido: string | null;
  razon_social: string | null;
  documento: string;
  telefono: string | null;
  direccion: string | null;
  email: string | null;
  tipo_documento_id: number;
}

export interface QuotationCurrencyDto {
  id: number;
  nombre: string;
  simbolo: string;
  codigo: string;
}

export interface QuotationBranchDto {
  id: number;
  nombre: string;
}

export interface QuotationStateDto {
  id: number;
  codigo: string;
  nombre: string;
}

/**
 * Shape actually returned by CotizacionController (raw Eloquent attributes,
 * snake_case). Verified empirically against a real request/response, not
 * assumed — the equivalent camelCase DTOs in other modules (e.g. CustomerDto)
 * do NOT match what the backend actually sends.
 */
export interface QuotationDto {
  id: number;
  empresa_id: number;
  sucursal_id: number;
  cliente_id: number | null;
  moneda_id: number | null;
  usuario_id: number;
  numero: string | null;
  numero_completo: string | null;
  fecha_emision: string | null;
  fecha_valido_hasta: string | null;
  mostrar_fecha_valido_hasta: boolean;
  nombre_contacto: string | null;
  telefono_contacto: string | null;
  correo_contacto: string | null;
  area_contacto: string | null;
  mostrar_moneda: boolean;
  subtotal: string;
  igv: string;
  igv_requerido: boolean;
  total: string;
  mostrar_total: boolean;
  descuento: string;
  observaciones: string | null;
  mostrar_observaciones: boolean;
  condiciones_pago: string | null;
  mostrar_condiciones_pago: boolean;
  tipo_pago_id: number | null;
  mostrar_tipo_pago: boolean;
  forma_pago: string | null;
  mostrar_forma_pago: boolean;
  plazo_entrega: string | null;
  mostrar_plazo_entrega: boolean;
  lugar_entrega: string | null;
  mostrar_lugar_entrega: boolean;
  garantia: string | null;
  mostrar_garantia: boolean;
  consideraciones: string | null;
  mostrar_consideraciones: boolean;
  servicio_complementario: string | null;
  mostrar_servicio_complementario: boolean;
  estado_id: number;
  detalles: QuotationDetailDto[];
  cliente?: QuotationCustomerDto;
  moneda?: QuotationCurrencyDto;
  sucursal?: QuotationBranchDto;
  estado_cotizacion?: QuotationStateDto;
}

import { QuotationDetailCreateDto } from "./quotation-detail-create-dto";

export interface QuotationCreateDto {
  id?: number;
  idSucursal: number;
  idUsuario: number;
  idCliente: number | null;
  idMoneda: number | null;
  idTipoPago: number | null;
  idSerie: number | null;
  fechaEmision: string | null;
  fechaValidoHasta: string | null;
  nombreContacto: string | null;
  telefonoContacto: string | null;
  correoContacto: string | null;
  areaContacto: string | null;
  descuento: number;
  igvRequerido: boolean;
  mostrarFechaValidoHasta: boolean;
  mostrarMoneda: boolean;
  mostrarTotal: boolean;
  mostrarObservaciones: boolean;
  mostrarCondicionesPago: boolean;
  mostrarTipoPago: boolean;
  mostrarFormaPago: boolean;
  mostrarPlazoEntrega: boolean;
  mostrarLugarEntrega: boolean;
  mostrarGarantia: boolean;
  mostrarConsideraciones: boolean;
  mostrarServicioComplementario: boolean;
  detalles: QuotationDetailCreateDto[];
}

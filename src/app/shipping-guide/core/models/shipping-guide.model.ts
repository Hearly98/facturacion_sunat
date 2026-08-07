import { ShippingGuideDetailModel } from './shipping-guide-detail.model';

export class ShippingGuideModel {
  serie_id: number = 0;
  numero_completo: string = '';
  suc_id: number = 0;
  fecha_emision: string = '';
  nro_cotizacion: string = '';
  nro_oc: string = '';
  nro_factura: string = '';
  cot_id: number = 0;
  fecha_factura: string = '';
  observaciones: string = '';
  cli_id: number = 0;
  nombre_cliente: string = '';
  doc_cliente: string = '';
  direccion_cliente: string = '';
  partida_ubigeo: string = '';
  partida_direccion: string = '';
  destino_ubigeo: string = '';
  destino_direccion: string = '';
  tipo_traslado: string = '';
  fecha_inicio_traslado: string = '';
  transportista_tipo_doc: string = '';
  transportista_nro_doc: string = '';
  transportista_licencia: string = '';
  transportista_placa: string = '';
  transportista_direccion: string = '';
  transportista_vehiculo: string = '';
  empresa_transporte_tipo_doc: string = '';
  empresa_transporte_nro_doc: string = '';
  empresa_transporte_razon_social: string = '';
  motivo_traslado: string = '';
  total_peso_bruto: number = 0;
  est: boolean = false;
  detalles?: ShippingGuideDetailModel[];
}

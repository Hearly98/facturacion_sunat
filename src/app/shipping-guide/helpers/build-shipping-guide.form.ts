import { FormArray, FormControl } from '@angular/forms';
import { ShippingGuideForm } from '../core/types/shipping-guide.form';
import { TypedFormControls } from '@shared/types/types-form';

export const buildShippingGuideForm = (): TypedFormControls<ShippingGuideForm> => {
  return {
    cli_id: new FormControl<number | null>(null),
    destino_direccion: new FormControl<string | null>(null),
    destino_ubigeo: new FormControl<string | null>(null),
    direccion_cliente: new FormControl<string | null>(null),
    doc_cliente: new FormControl<string | null>(null),
    empresa_transporte_nro_doc: new FormControl<string | null>(null),
    empresa_transporte_razon_social: new FormControl<string | null>(null),
    empresa_transporte_tipo_doc: new FormControl<string | null>('RUC'),
    fecha_emision: new FormControl<string | null>({ value: null, disabled: true }),
    fecha_factura: new FormControl<string | null>(null),
    fecha_inicio_traslado: new FormControl<string | null>(null),
    motivo_traslado: new FormControl<string | null>(null),
    nombre_cliente: new FormControl<string | null>(null),
    nro_cotizacion: new FormControl<string | null>(null),
    nro_factura: new FormControl<string | null>(null),
    numero_completo: new FormControl<string | null>(null),
    nro_oc: new FormControl<string | null>(null),
    observaciones: new FormControl<string | null>(null),
    partida_direccion: new FormControl<string | null>(null),
    partida_ubigeo: new FormControl<string | null>(null),
    serie_id: new FormControl<number | null>(null),
    tipo_traslado: new FormControl<string | null>('PUBLICO'),
    transportista_licencia: new FormControl<string | null>(null),
    transportista_nro_doc: new FormControl<string | null>(null),
    transportista_placa: new FormControl<string | null>(null),
    transportista_tipo_doc: new FormControl<string | null>(null),
    transportista_vehiculo: new FormControl<string | null>(null),
    transportista_direccion: new FormControl<string | null>(null),
    suc_id: new FormControl<number | null>(null),
    est: new FormControl<boolean | null>(false),
    detalles: new FormArray<any>([]),
    prod_id: new FormControl<number | null>(null),
    cot_id: new FormControl<number | null>(null),
    peso_bruto: new FormControl<number | null>(null),
    id_cotizacion: new FormControl<number | null>(null),
  };
};

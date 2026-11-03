import { FormArray, FormControl, Validators } from '@angular/forms';
import { ShippingGuideForm } from '../core/types/shipping-guide.form';
import { TypedFormControls } from '@shared/types/types-form';

const UBIGEO = [Validators.required, Validators.pattern(/^\d{6}$/)];

/**
 * Validadores alineados con GuiaRemisionController::store (datos obligatorios de la GRE).
 * Los del transportista dependen del tipo de traslado: ver applyTransportValidators().
 * El bloqueo por cotización no se decide aquí sino en applyCotizacionLock().
 */
export const buildShippingGuideForm = (): TypedFormControls<ShippingGuideForm> => ({
  cli_id: new FormControl<number | null>(null),
  nombre_cliente: new FormControl<string | null>(null, Validators.required),
  doc_cliente: new FormControl<string | null>(null, Validators.required),
  direccion_cliente: new FormControl<string | null>(null, Validators.required),
  partida_ubigeo: new FormControl<string | null>(null, UBIGEO),
  partida_direccion: new FormControl<string | null>(null, Validators.required),
  destino_ubigeo: new FormControl<string | null>(null, UBIGEO),
  destino_direccion: new FormControl<string | null>(null, Validators.required),
  fecha_emision: new FormControl<string | null>({ value: null, disabled: true }),
  fecha_inicio_traslado: new FormControl<string | null>(null, Validators.required),
  motivo_traslado: new FormControl<string | null>(null, Validators.required),
  tipo_traslado: new FormControl<string | null>('PRIVADO', Validators.required),
  transportista_tipo_doc: new FormControl<string | null>('DNI'),
  transportista_nro_doc: new FormControl<string | null>(null),
  transportista_licencia: new FormControl<string | null>(null),
  transportista_placa: new FormControl<string | null>(null),
  transportista_vehiculo: new FormControl<string | null>(null),
  transportista_direccion: new FormControl<string | null>(null),
  empresa_transporte_tipo_doc: new FormControl<string | null>('RUC'),
  empresa_transporte_nro_doc: new FormControl<string | null>(null),
  empresa_transporte_razon_social: new FormControl<string | null>(null),
  fecha_factura: new FormControl<string | null>(null),
  nro_cotizacion: new FormControl<string | null>(null),
  nro_factura: new FormControl<string | null>(null),
  numero_completo: new FormControl<string | null>(null),
  nro_oc: new FormControl<string | null>(null),
  observaciones: new FormControl<string | null>(null),
  serie_id: new FormControl<number | null>(null),
  suc_id: new FormControl<number | null>(null),
  est: new FormControl<boolean | null>(false),
  detalles: new FormArray<any>([]),
  prod_id: new FormControl<number | null>(null),
  cot_id: new FormControl<number | null>(null),
  total_peso_bruto: new FormControl<number | null>(null),
  id_cotizacion: new FormControl<number | null>(null),
});

import { AbstractControl, FormArray, FormGroup, Validators } from '@angular/forms';

/** Etiquetas que ve el usuario cuando falta algo, en el orden en que aparecen en pantalla. */
export const SHIPPING_GUIDE_LABELS: Record<string, string> = {
  nombre_cliente: 'Cliente',
  doc_cliente: 'Documento del cliente',
  direccion_cliente: 'Dirección del cliente',
  partida_ubigeo: 'Ubigeo de partida',
  partida_direccion: 'Dirección de partida',
  destino_ubigeo: 'Ubigeo de destino',
  destino_direccion: 'Dirección de destino',
  fecha_inicio_traslado: 'Fecha de traslado',
  tipo_traslado: 'Tipo de traslado',
  motivo_traslado: 'Motivo de traslado',
  empresa_transporte_nro_doc: 'RUC de la empresa de transporte',
  empresa_transporte_razon_social: 'Razón social de la empresa de transporte',
  transportista_nro_doc: 'Documento del conductor',
  transportista_licencia: 'Licencia del conductor',
  transportista_placa: 'Placa del vehículo',
};

export const SHIPPING_GUIDE_DETAIL_LABELS: Record<string, string> = {
  cantidad: 'cantidad mayor a 0',
  und_id: 'unidad de medida',
};

const PUBLICO = ['empresa_transporte_nro_doc', 'empresa_transporte_razon_social'];
const PRIVADO = ['transportista_nro_doc', 'transportista_licencia', 'transportista_placa'];

/**
 * Público: la mercadería la lleva una empresa transportista (su RUC y razón social).
 * Privado: la lleva la propia empresa (conductor, licencia y placa). Mismo criterio que el
 * required_if del backend.
 */
export function applyTransportValidators(form: FormGroup, tipo = form.get('tipo_traslado')?.value): void {
  const requeridos = tipo === 'PUBLICO' ? PUBLICO : PRIVADO;
  for (const name of [...PUBLICO, ...PRIVADO]) {
    const control = form.get(name);
    if (!control) continue;
    const validators = requeridos.includes(name) ? [Validators.required] : [];
    if (name === 'empresa_transporte_nro_doc' && requeridos.includes(name)) {
      validators.push(Validators.pattern(/^\d{11}$/));
    }
    control.setValidators(validators);
    control.updateValueAndValidity({ emitEvent: false });
  }
}

const CLIENTE = ['cli_id', 'nombre_cliente', 'doc_cliente', 'direccion_cliente'];
const LINEA = ['cantidad', 'und_id'];

/**
 * Guía vinculada a una cotización: el cliente y los bienes vienen de ella y no se tocan
 * (mismo criterio que GuiaRemisionController::collectLockedDiffs). Lo logístico —partida,
 * destino, traslado, transportista— no existe en la cotización y queda editable.
 */
export function applyCotizacionLock(form: FormGroup, locked: boolean): void {
  const toggle = (control: AbstractControl | null) =>
    locked ? control?.disable({ emitEvent: false }) : control?.enable({ emitEvent: false });

  CLIENTE.forEach((name) => toggle(form.get(name)));
  (form.get('detalles') as FormArray).controls.forEach((row) => LINEA.forEach((name) => toggle(row.get(name))));
}

export interface ShippingGuideEstado {
  codigo: string;
  nombre: string;
}

export interface ShippingGuideDetailRow {
  guia_det_id: number;
  prod_id: number;
  und_id: number;
  und_nom: string | null;
  prod_cod: string;
  prod_nom: string;
  cantidad: number;
  peso_unitario: number;
  peso_total: number;
  descripcion: string;
  precio_unitario: number | null;
  descuento: number;
}

const dateOnly = (value?: string | null) => (value ? String(value).slice(0, 10) : null);
const num = (value: unknown) => (value === null || value === undefined || value === '' ? null : Number(value));

/**
 * Traduce GET /guias-remision/{id} (modelo Eloquent crudo: id, cotizacion_id, producto_id,
 * unidad_id...) a los nombres del formulario. Antes el front leía guia_id/cot_id/prod_id,
 * que el backend nunca envió.
 */
export function shippingGuideFromApi(guia: any) {
  const header = {
    cot_id: guia.cotizacion_id ?? null,
    cli_id: guia.cliente_id ?? null,
    numero_completo: guia.numero_completo ?? null,
    nro_cotizacion: guia.nro_cotizacion ?? null,
    fecha_emision: dateOnly(guia.fecha_emision),
    fecha_inicio_traslado: dateOnly(guia.fecha_inicio_traslado),
    fecha_factura: dateOnly(guia.fecha_factura),
    nombre_cliente: guia.nombre_cliente ?? null,
    doc_cliente: guia.doc_cliente ?? null,
    direccion_cliente: guia.direccion_cliente ?? null,
    partida_ubigeo: guia.partida_ubigeo ?? null,
    partida_direccion: guia.partida_direccion ?? null,
    destino_ubigeo: guia.destino_ubigeo ?? null,
    destino_direccion: guia.destino_direccion ?? null,
    tipo_traslado: guia.tipo_traslado ?? 'PRIVADO',
    motivo_traslado: guia.motivo_traslado ?? null,
    transportista_tipo_doc: guia.transportista_tipo_doc ?? 'DNI',
    transportista_nro_doc: guia.transportista_nro_doc ?? null,
    transportista_licencia: guia.transportista_licencia ?? null,
    transportista_placa: guia.transportista_placa ?? null,
    transportista_vehiculo: guia.transportista_vehiculo ?? null,
    transportista_direccion: guia.transportista_direccion ?? null,
    empresa_transporte_tipo_doc: guia.empresa_transporte_tipo_doc ?? 'RUC',
    empresa_transporte_nro_doc: guia.empresa_transporte_nro_doc ?? null,
    empresa_transporte_razon_social: guia.empresa_transporte_razon_social ?? null,
    nro_oc: guia.nro_oc ?? null,
    nro_factura: guia.nro_factura ?? null,
    observaciones: guia.observaciones ?? null,
    total_peso_bruto: num(guia.total_peso_bruto),
    suc_id: guia.sucursal_id ?? null,
  };

  const details: ShippingGuideDetailRow[] = (guia.detalles ?? []).map((d: any) => ({
    guia_det_id: d.id,
    prod_id: d.producto_id,
    und_id: d.unidad_id,
    und_nom: d.unidad?.nombre ?? d.producto?.unidad?.nombre ?? null,
    prod_cod: d.producto?.codigo_interno ?? '',
    prod_nom: d.prod_nom || d.producto?.nombre || '',
    cantidad: Number(d.cantidad),
    peso_unitario: num(d.peso_unitario) ?? 0,
    peso_total: num(d.peso_total) ?? 0,
    descripcion: d.descripcion || d.prod_nom || d.producto?.nombre || '',
    precio_unitario: num(d.precio_unitario),
    descuento: num(d.descuento) ?? 0,
  }));

  const estado: ShippingGuideEstado | null = guia.estado_guia_remision
    ? { codigo: guia.estado_guia_remision.codigo, nombre: guia.estado_guia_remision.nombre }
    : null;

  return { header, details, estado };
}

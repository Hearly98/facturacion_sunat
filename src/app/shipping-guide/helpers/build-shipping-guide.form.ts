import { FormArray, FormControl } from '@angular/forms';
import { ShippingGuideForm } from '../core/types/shipping-guide.form';
import { TypedFormControls } from '@shared/types/types-form';

export const buildShippingGuideForm = (isCotizacionAttached: boolean = false): TypedFormControls<ShippingGuideForm> => {
  const lockedState = isCotizacionAttached ? { disabled: true } : null;

  return {
    cli_id: new FormControl<number | null>({ value: null, disabled: isCotizacionAttached }),
    destino_direccion: new FormControl<string | null>({ value: null, disabled: isCotizacionAttached }),
    destino_ubigeo: new FormControl<string | null>({ value: null, disabled: isCotizacionAttached }),
    direccion_cliente: new FormControl<string | null>({ value: null, disabled: isCotizacionAttached }),
    doc_cliente: new FormControl<string | null>({ value: null, disabled: isCotizacionAttached }),
    empresa_transporte_nro_doc: new FormControl<string | null>({ value: null, disabled: isCotizacionAttached }),
    empresa_transporte_razon_social: new FormControl<string | null>({ value: null, disabled: isCotizacionAttached }),
    empresa_transporte_tipo_doc: new FormControl<string | null>({ value: 'RUC', disabled: isCotizacionAttached }),
    fecha_emision: new FormControl<string | null>({ value: null, disabled: true }),
    fecha_factura: new FormControl<string | null>({ value: null, disabled: isCotizacionAttached }),
    fecha_inicio_traslado: new FormControl<string | null>({ value: null, disabled: isCotizacionAttached }),
    motivo_traslado: new FormControl<string | null>({ value: null, disabled: isCotizacionAttached }),
    nombre_cliente: new FormControl<string | null>({ value: null, disabled: isCotizacionAttached }),
    nro_cotizacion: new FormControl<string | null>(null),
    nro_factura: new FormControl<string | null>({ value: null, disabled: isCotizacionAttached }),
    numero_completo: new FormControl<string | null>(null),
    nro_oc: new FormControl<string | null>(null),
    observaciones: new FormControl<string | null>({ value: null, disabled: isCotizacionAttached }),
    partida_direccion: new FormControl<string | null>({ value: null, disabled: isCotizacionAttached }),
    partida_ubigeo: new FormControl<string | null>({ value: null, disabled: isCotizacionAttached }),
    serie_id: new FormControl<number | null>(null),
    tipo_traslado: new FormControl<string | null>({ value: 'PUBLICO', disabled: isCotizacionAttached }),
    transportista_licencia: new FormControl<string | null>({ value: null, disabled: isCotizacionAttached }),
    transportista_nro_doc: new FormControl<string | null>({ value: null, disabled: isCotizacionAttached }),
    transportista_placa: new FormControl<string | null>({ value: null, disabled: isCotizacionAttached }),
    transportista_tipo_doc: new FormControl<string | null>({ value: null, disabled: isCotizacionAttached }),
    transportista_vehiculo: new FormControl<string | null>({ value: null, disabled: isCotizacionAttached }),
    transportista_direccion: new FormControl<string | null>({ value: null, disabled: isCotizacionAttached }),
    suc_id: new FormControl<number | null>(null),
    est: new FormControl<boolean | null>(false),
    detalles: new FormArray<any>([]),
    prod_id: new FormControl<number | null>(null),
    cot_id: new FormControl<number | null>(null),
    peso_bruto: new FormControl<number | null>(null),
    id_cotizacion: new FormControl<number | null>(null),
  };
};

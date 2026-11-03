import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { buildShippingGuideForm } from './build-shipping-guide.form';
import { buildShippingGuideDetail } from './build-shipping-guide-detail';
import {
  applyCotizacionLock,
  applyTransportValidators,
  shippingGuideFromApi,
  SHIPPING_GUIDE_LABELS,
} from './shipping-guide-rules';
import { findMissingFields } from '@shared/functions';

describe('Guía de remisión: formulario y reglas', () => {
  const fb = new FormBuilder();
  let form: FormGroup;

  const detalles = () => form.get('detalles') as FormArray;

  const completarValido = () => {
    form.patchValue({
      nombre_cliente: 'Hearly Prueba',
      doc_cliente: '70000001',
      direccion_cliente: 'Av. Prueba 123',
      partida_ubigeo: '150101',
      partida_direccion: 'Av. Principal 123',
      destino_ubigeo: '150104',
      destino_direccion: 'Av. Prueba 123',
      fecha_inicio_traslado: '2026-11-03',
      motivo_traslado: 'Venta',
      tipo_traslado: 'PRIVADO',
      transportista_nro_doc: '44556677',
      transportista_licencia: 'Q44556677',
      transportista_placa: 'ABC-123',
    });
    detalles().push(fb.group(buildShippingGuideDetail({ prod_id: 1, prod_nom: 'Arroz', cantidad: 2, und_id: 2 })));
  };

  beforeEach(() => {
    form = fb.group(buildShippingGuideForm());
    applyTransportValidators(form);
  });

  it('una guía completa es válida', () => {
    completarValido();
    expect(form.valid).toBeTrue();
  });

  it('exige los datos que pide SUNAT y los nombra en lenguaje del usuario', () => {
    const missing = findMissingFields(form, SHIPPING_GUIDE_LABELS);

    expect(missing).toEqual(jasmine.arrayContaining([
      'Cliente', 'Ubigeo de partida', 'Dirección de partida', 'Ubigeo de destino',
      'Dirección de destino', 'Motivo de traslado',
    ]));
  });

  it('el ubigeo debe tener 6 dígitos', () => {
    completarValido();
    form.patchValue({ partida_ubigeo: '1501' });

    expect(form.get('partida_ubigeo')!.invalid).toBeTrue();
  });

  it('transporte público exige la empresa transportista y no el conductor', () => {
    completarValido();
    form.patchValue({
      tipo_traslado: 'PUBLICO',
      transportista_nro_doc: null, transportista_licencia: null, transportista_placa: null,
    });
    applyTransportValidators(form); // la página lo hace al cambiar tipo_traslado (valueChanges)

    expect(findMissingFields(form, SHIPPING_GUIDE_LABELS)).toEqual([
      'RUC de la empresa de transporte', 'Razón social de la empresa de transporte',
    ]);

    form.patchValue({ empresa_transporte_nro_doc: '20100070970', empresa_transporte_razon_social: 'Transportes SAC' });
    expect(form.valid).toBeTrue();
  });

  it('la línea exige unidad de medida y cantidad mayor a 0', () => {
    completarValido();
    detalles().at(0).patchValue({ und_id: null, cantidad: 0 });

    expect(detalles().at(0).invalid).toBeTrue();
  });

  it('la descripción de la línea toma el nombre del producto si no viene', () => {
    const linea = fb.group(buildShippingGuideDetail({ prod_id: 1, prod_nom: 'Arroz', cantidad: 1, und_id: 2 }));
    expect(linea.get('descripcion')!.value).toBe('Arroz');
  });

  describe('vinculada a cotización', () => {
    beforeEach(() => {
      completarValido();
      applyCotizacionLock(form, true);
    });

    it('bloquea el cliente y la cantidad/unidad de cada línea', () => {
      expect(form.get('nombre_cliente')!.disabled).toBeTrue();
      expect(form.get('doc_cliente')!.disabled).toBeTrue();
      expect(form.get('direccion_cliente')!.disabled).toBeTrue();
      expect(detalles().at(0).get('cantidad')!.disabled).toBeTrue();
      expect(detalles().at(0).get('und_id')!.disabled).toBeTrue();
    });

    it('deja editables los datos logísticos, que la cotización no trae', () => {
      for (const campo of ['partida_ubigeo', 'destino_direccion', 'tipo_traslado', 'motivo_traslado',
        'fecha_inicio_traslado', 'transportista_placa', 'observaciones']) {
        expect(form.get(campo)!.enabled).withContext(campo).toBeTrue();
      }
    });

    it('lo bloqueado igual viaja al backend con getRawValue', () => {
      expect(form.getRawValue().nombre_cliente).toBe('Hearly Prueba');
      expect(form.getRawValue().detalles[0].cantidad).toBe(2);
    });

    it('al desvincular se vuelve a habilitar todo', () => {
      applyCotizacionLock(form, false);

      expect(form.get('nombre_cliente')!.enabled).toBeTrue();
      expect(detalles().at(0).get('cantidad')!.enabled).toBeTrue();
    });
  });

  describe('shippingGuideFromApi', () => {
    // Forma real de GET /guias-remision/{id}: el modelo Eloquent crudo.
    const api = {
      id: 7,
      cotizacion_id: 1,
      cliente_id: 3,
      numero_completo: 'T001-00000007',
      fecha_emision: '2026-11-03T00:00:00.000000Z',
      fecha_inicio_traslado: '2026-11-04T00:00:00.000000Z',
      nro_cotizacion: 'COT01-00000001',
      nombre_cliente: 'Hearly Prueba',
      partida_ubigeo: '150101',
      tipo_traslado: 'PRIVADO',
      estado_guia_remision: { codigo: '02', nombre: 'Facturado' },
      detalles: [
        { id: 11, producto_id: 1, unidad_id: 2, prod_nom: 'Arroz', cantidad: 3, peso_unitario: '1.50',
          peso_total: '4.50', descripcion: null, precio_unitario: '114.00', descuento: '0.00',
          producto: { codigo_interno: 'ARR-001', nombre: 'Arroz Costeño' } },
      ],
    };

    it('traduce los nombres reales del backend a los del formulario', () => {
      const { header, details, estado } = shippingGuideFromApi(api);

      expect(header.cot_id).toBe(1);
      expect(header.cli_id).toBe(3);
      expect(header.fecha_emision).toBe('2026-11-03');
      expect(header.fecha_inicio_traslado).toBe('2026-11-04');
      expect(estado).toEqual({ codigo: '02', nombre: 'Facturado' });
      expect(details[0]).toEqual(jasmine.objectContaining({
        prod_id: 1, und_id: 2, cantidad: 3, prod_cod: 'ARR-001', prod_nom: 'Arroz',
        peso_unitario: 1.5, precio_unitario: 114, descripcion: 'Arroz',
      }));
    });
  });
});

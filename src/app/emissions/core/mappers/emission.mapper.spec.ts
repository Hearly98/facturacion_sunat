import { EmissionMapper } from './emission.mapper';

describe('EmissionMapper', () => {
  const dto = {
    id: 1, familia: 'boletas' as const, venta_id: 7, tipo_documento: '07', tipo_nombre: 'Nota de crédito', numero: 'BC01-00000001',
    documento_afectado: 'B001-00000015', cliente: 'CLIENTES VARIOS', total: '118.00' as unknown as number, estado: 'ESPERANDO_DEPENDENCIA' as const,
    fecha_emision: '2026-10-29T15:30:00-05:00', programada_para: null, fecha_limite: '2026-11-05T23:59:59-05:00', horas_restantes: 176,
    intentos: 0, proximo_intento_en: null, codigo_respuesta: null, descripcion_respuesta: null,
  };

  it('fromApi traduce al modelo del front', () => {
    const e = EmissionMapper.fromApi(dto);

    expect(e.family).toBe('boletas');
    expect(e.affectedDocument).toBe('B001-00000015');
    expect(e.total).toBe(118);
    expect(e.hoursLeft).toBe(176);
    expect(e.status).toBe('ESPERANDO_DEPENDENCIA');
  });

  it('detailFromApi incluye el historial', () => {
    const d = EmissionMapper.detailFromApi({
      ...dto, observaciones: ['4252 - x'], hash: 'H', tiene_xml: true, tiene_cdr: false,
      historial: [{ numero: 1, estado: 'ERROR', codigo: '0109', descripcion: 'caído', fecha: '2026-10-29T16:00:00Z' }],
    });

    expect(d.observations).toEqual(['4252 - x']);
    expect(d.hasXml).toBeTrue();
    expect(d.history[0]).toEqual({ number: 1, status: 'ERROR', code: '0109', description: 'caído', date: '2026-10-29T16:00:00Z' });
  });

  it('filtersToParams solo envía los filtros con valor', () => {
    expect(EmissionMapper.filtersToParams({ family: 'facturas', status: '', search: '  ', dueSoon: true, page: 2 })).toEqual({
      familia: 'facturas', por_vencer: '1', page: '2', per_page: '20',
    });
    expect(EmissionMapper.filtersToParams({ family: 'boletas', status: 'RECHAZADA', from: '2026-10-01', to: '2026-10-31', search: 'B001' })).toEqual(
      jasmine.objectContaining({ estado: 'RECHAZADA', desde: '2026-10-01', hasta: '2026-10-31', buscar: 'B001' }),
    );
  });

  it('política: los días solo se envían en PROGRAMADO y hay valores por defecto', () => {
    expect(EmissionMapper.policyToApi({ type: 'FIN_DEL_DIA', time: '22:00', days: [1], safetyMarginHours: 12, warnings: [] })).toEqual({
      politica_envio: 'FIN_DEL_DIA', hora_envio: '22:00', dias_envio: [], margen_seguridad_horas: 12,
    });
    expect(EmissionMapper.policyFromApi(undefined).type).toBe('INMEDIATO');
  });
});

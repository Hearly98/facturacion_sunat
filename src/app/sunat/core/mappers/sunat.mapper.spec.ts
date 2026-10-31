import { SunatMapper } from './sunat.mapper';

describe('SunatMapper', () => {
  it('configFromApi traduce credenciales sin exponer secretos', () => {
    const config = SunatMapper.configFromApi({
      ambiente: 'produccion',
      auto_envio: false,
      max_intentos: 3,
      timeout_segundos: 60,
      credenciales: { sol_usuario: 'USUARIO1', tiene_clave_sol: true, tiene_certificado: true, certificado_vence: '2027-10-29' },
    });

    expect(config).toEqual({
      policy: { type: 'INMEDIATO', time: '23:00', days: [], safetyMarginHours: 24, warnings: [] },
      environment: 'produccion',
      autoSend: false,
      solUser: 'USUARIO1',
      hasSolPassword: true,
      hasCertificate: true,
      certificateExpiresAt: '2027-10-29',
      credentialsStatus: 'INCOMPLETAS',
      credentialsMessage: null,
    });
  });

  it('configFromApi expone el estado ILEGIBLES y su mensaje', () => {
    const config = SunatMapper.configFromApi({
      ambiente: 'prueba', auto_envio: false, max_intentos: 3, timeout_segundos: 60,
      credenciales: {
        estado: 'ILEGIBLES', mensaje: 'Vuelva a registrarlas.',
        sol_usuario: 'USUARIO1', tiene_clave_sol: false, tiene_certificado: false, certificado_vence: null,
      },
    });

    expect(config.credentialsStatus).toBe('ILEGIBLES');
    expect(config.credentialsMessage).toBe('Vuelva a registrarlas.');
  });


  it('creditNoteLineFromApi convierte el precio a número', () => {
    const line = SunatMapper.creditNoteLineFromApi({
      venta_detalle_id: 3, codigo: 'P1', nombre: 'Gaseosa', precio_unitario: '9.6300000000' as unknown as number,
      cantidad_vendida: 3, cantidad_devuelta: 1, cantidad_disponible: 2,
    });

    expect(line.unitPrice).toBe(9.63);
    expect(line.availableQuantity).toBe(2);
    expect(line.saleDetailId).toBe(3);
  });

  it('createCreditNoteToApi descarta líneas en cero y usa los nombres del backend', () => {
    expect(
      SunatMapper.createCreditNoteToApi({
        saleId: 10,
        reason: '07',
        items: [{ saleDetailId: 1, quantity: 2 }, { saleDetailId: 2, quantity: 0 }],
      }),
    ).toEqual({ venta_id: 10, motivo: '07', items: [{ venta_detalle_id: 1, cantidad: 2 }] });
  });

  it('creditNoteFromApi', () => {
    const note = SunatMapper.creditNoteFromApi({
      id: 5, venta_id: 10, documento_afectado: 'B001-00000015', numero: 'BC01-00000001', fecha_emision: '2026-10-29',
      motivo_codigo: '01', motivo_descripcion: 'ANULACIÓN DE LA OPERACIÓN', total: '354.00' as unknown as number,
    });

    expect(note.total).toBe(354);
    expect(note.affectedDocument).toBe('B001-00000015');
  });
});

import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { environment } from 'src/environments/environment';
import { SunatService, sunatErrorMessage } from './sunat.service';

describe('SunatService', () => {
  let service: SunatService;
  let http: HttpTestingController;
  const api = environment.apiUrl;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(SunatService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());


  it('saveCredentials envía multipart y solo adjunta el certificado si existe', () => {
    service.saveCredentials('USR', 'clave', null, null).subscribe();

    const req = http.expectOne(`${api}/sunat/configuracion/credenciales`);
    const body = req.request.body as FormData;
    expect(body.get('sol_usuario')).toBe('USR');
    expect(body.get('sol_clave')).toBe('clave');
    expect(body.has('certificado')).toBeFalse();
    req.flush({ ambiente: 'prueba', auto_envio: false, credenciales: { sol_usuario: 'USR', tiene_clave_sol: true, tiene_certificado: true, certificado_vence: null } });
  });

  it('saveEnvironment usa PUT si ya existe configuración y POST si no', () => {
    service.saveEnvironment('produccion', true).subscribe();
    expect(http.expectOne(`${api}/sunat/configuracion`).request.method).toBe('PUT');

    service.saveEnvironment('prueba', false).subscribe();
    const post = http.expectOne(`${api}/sunat/configuracion`);
    expect(post.request.method).toBe('POST');
    expect(post.request.body.ambiente).toBe('prueba');
  });

  it('getCreditNoteBalance desenvuelve data y mapea las líneas', () => {
    let canCancel: boolean | undefined;
    service.getCreditNoteBalance(10).subscribe((b) => (canCancel = b.canCancel));

    http.expectOne(`${api}/ventas/10/notas-credito/saldo`).flush({ data: { puede_anular: true, lineas: [] } });

    expect(canCancel).toBeTrue();
  });

  it('createCreditNote envía el payload del backend', () => {
    service.createCreditNote({ saleId: 10, reason: '01', items: [] }).subscribe();

    const req = http.expectOne(`${api}/notas-credito`);
    expect(req.request.body).toEqual({ venta_id: 10, motivo: '01', items: [] });
    req.flush({ data: { id: 1, venta_id: 10, numero: 'BC01-00000001', total: 10, estado_sunat: 'PENDIENTE' } });
  });

  it('savePolicy guarda la política junto al ambiente y recarga la configuración', () => {
    let warnings: string[] = [];
    service
      .savePolicy({ type: 'PROGRAMADO', time: '08:00', days: [1], safetyMarginHours: 24, warnings: [] }, 'prueba', true)
      .subscribe((c) => (warnings = c.policy.warnings));

    const put = http.expectOne(`${api}/sunat/configuracion`);
    expect(put.request.method).toBe('PUT');
    expect(put.request.body).toEqual(jasmine.objectContaining({ ambiente: 'prueba', politica_envio: 'PROGRAMADO', hora_envio: '08:00', dias_envio: [1] }));
    put.flush({});

    http.expectOne(`${api}/sunat/configuracion`).flush({
      ambiente: 'prueba', auto_envio: false, max_intentos: 3, timeout_segundos: 60,
      politica: { tipo: 'PROGRAMADO', hora_envio: '08:00', dias_envio: [1], margen_seguridad_horas: 24, advertencias: ['facturas se toparán'] },
      credenciales: { sol_usuario: null, tiene_clave_sol: false, tiene_certificado: false, certificado_vence: null },
    });
    expect(warnings).toEqual(['facturas se toparán']);
  });

  it('el PDF de la nota de crédito se pide como blob', () => {
    service.downloadCreditNotePdf(5).subscribe();
    const req = http.expectOne(`${api}/notas-credito/5/pdf`);
    expect(req.request.responseType).toBe('blob');
    req.flush(new Blob(['%PDF']));
  });

  it('sunatErrorMessage prioriza el message del backend', () => {
    expect(sunatErrorMessage({ error: { message: 'Falta certificado' } })).toBe('Falta certificado');
    expect(sunatErrorMessage({})).toContain('SUNAT');
  });
});

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

  it('sendSale hace POST a ventas/{id}/sunat/enviar y mapea el resultado', () => {
    let status = '';
    service.sendSale(7).subscribe((r) => (status = r.status));

    const req = http.expectOne(`${api}/ventas/7/sunat/enviar`);
    expect(req.request.method).toBe('POST');
    req.flush({ estado: 'ACEPTADA', codigo: '0', descripcion: 'ok', observaciones: [], numero: 'B001-00000001', hash: 'H' });

    expect(status).toBe('ACEPTADA');
  });

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

  it('descargas piden blob con la respuesta completa (para leer el nombre)', () => {
    service.downloadSaleFile(7, 'cdr').subscribe();
    const req = http.expectOne(`${api}/ventas/7/sunat/cdr`);
    expect(req.request.responseType).toBe('blob');
    req.flush(new Blob(['PK']));
  });

  it('sunatErrorMessage prioriza el message del backend', () => {
    expect(sunatErrorMessage({ error: { message: 'Falta certificado' } })).toBe('Falta certificado');
    expect(sunatErrorMessage({})).toContain('SUNAT');
  });
});

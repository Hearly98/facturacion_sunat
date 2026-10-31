import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { environment } from 'src/environments/environment';
import { EmissionService, emissionErrorMessage } from './emission.service';

describe('EmissionService', () => {
  let service: EmissionService;
  let http: HttpTestingController;
  const api = `${environment.apiUrl}/emisiones`;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(EmissionService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('list filtra por familia y desenvuelve la paginación', () => {
    let total = 0;
    service.list({ family: 'boletas', page: 1 }).subscribe((p) => (total = p.total));

    const req = http.expectOne((r) => r.url === api && r.params.get('familia') === 'boletas');
    req.flush({ data: [], pagination: { total: 3, page: 1, last_page: 1 } });

    expect(total).toBe(3);
  });

  it('summary por familia', () => {
    let attention = 0;
    service.summary('facturas').subscribe((s) => (attention = s.needsAttention));

    http.expectOne(`${api}/resumen?familia=facturas`).flush({ data: { total: 2, por_estado: {}, pendientes: 1, requieren_atencion: 1 } });

    expect(attention).toBe(1);
  });

  it('sendNow, reschedule y sendBatch usan los endpoints del módulo', () => {
    service.sendNow(5).subscribe();
    expect(http.expectOne(`${api}/5/enviar`).request.method).toBe('POST');

    service.reschedule(5).subscribe();
    expect(http.expectOne(`${api}/5/reprogramar`).request.method).toBe('POST');

    let queued = 0;
    service.sendBatch([1, 2]).subscribe((r) => (queued = r.queued));
    const batch = http.expectOne(`${api}/enviar-lote`);
    expect(batch.request.body).toEqual({ ids: [1, 2] });
    batch.flush({ data: { encoladas: 2, omitidas: 0 } });
    expect(queued).toBe(2);
  });

  it('descargas como blob con respuesta completa', () => {
    service.download(5, 'cdr').subscribe();
    const req = http.expectOne(`${api}/5/cdr`);
    expect(req.request.responseType).toBe('blob');
    req.flush(new Blob(['PK']));
  });

  it('mensaje de error del backend', () => {
    expect(emissionErrorMessage({ error: { message: 'Ya fue aceptado' } })).toBe('Ya fue aceptado');
  });
});

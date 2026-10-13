import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { environment } from '../../../../environments/environment';
import { KardexService } from './kardex.service';

describe('KardexService', () => {
  let service: KardexService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(KardexService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  // REGRESSION: the page called POST /kardex/search, which never existed in the API.
  it('queries GET /kardex/movimientos with product, warehouse and date range', () => {
    service.getKardex({ productId: 5, warehouseId: 2, dateFrom: '2026-10-01', dateTo: '2026-10-31' }).subscribe();

    const req = http.expectOne((r) => r.url === `${environment.apiUrl}/kardex/movimientos`);
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('producto_id')).toBe('5');
    expect(req.request.params.get('almacen_id')).toBe('2');
    expect(req.request.params.get('fecha_desde')).toBe('2026-10-01');
    expect(req.request.params.get('fecha_hasta')).toBe('2026-10-31');
    req.flush({ isValid: true, data: { producto_id: 5, almacen_id: 2, saldo_inicial: 0, stock_final: 0, movimientos: [] } });
  });

  it('omits empty dates', () => {
    service.getKardex({ productId: 5, warehouseId: 2, dateFrom: null, dateTo: null }).subscribe();

    const req = http.expectOne((r) => r.url === `${environment.apiUrl}/kardex/movimientos`);
    expect(req.request.params.has('fecha_desde')).toBeFalse();
    expect(req.request.params.has('fecha_hasta')).toBeFalse();
    req.flush({ isValid: true, data: { producto_id: 5, almacen_id: 2, saldo_inicial: 0, stock_final: 0, movimientos: [] } });
  });

  it('maps the response to the kardex model', () => {
    let opening: number | undefined;
    service.getKardex({ productId: 5, warehouseId: 2, dateFrom: null, dateTo: null }).subscribe((res) => {
      opening = res.data.openingBalance;
    });

    http
      .expectOne((r) => r.url === `${environment.apiUrl}/kardex/movimientos`)
      .flush({ isValid: true, data: { producto_id: 5, almacen_id: 2, saldo_inicial: 12, stock_final: 12, movimientos: [] } });

    expect(opening).toBe(12);
  });
});

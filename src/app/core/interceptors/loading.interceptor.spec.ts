import { TestBed } from '@angular/core/testing';
import { HttpHeaders, HttpRequest } from '@angular/common/http';
import { of } from 'rxjs';
import { loadingInterceptor, SKIP_LOADING_HEADER } from './loading.interceptor';
import { LoadingService } from '../services/loading.service';

describe('loadingInterceptor', () => {
  let loadingServiceSpy: jasmine.SpyObj<LoadingService>;

  beforeEach(() => {
    loadingServiceSpy = jasmine.createSpyObj('LoadingService', ['show', 'hide']);
    TestBed.configureTestingModule({
      providers: [{ provide: LoadingService, useValue: loadingServiceSpy }],
    });
  });

  it('calls show() before the request and hide() when it completes', () => {
    const req = new HttpRequest('GET', '/api/clientes');
    const next = jasmine.createSpy('next').and.returnValue(of({} as any));

    // `of(...)` completes synchronously, and finalize()'s teardown runs synchronously
    // too -- by the time subscribe() returns, both show() and hide() already ran.
    TestBed.runInInjectionContext(() => {
      loadingInterceptor(req, next).subscribe();
    });

    expect(loadingServiceSpy.show).toHaveBeenCalled();
    expect(loadingServiceSpy.hide).toHaveBeenCalled();
  });

  it('skips the loading service entirely when X-Skip-Loading is set', (done) => {
    const req = new HttpRequest('GET', '/api/clientes', {
      headers: new HttpHeaders({ [SKIP_LOADING_HEADER]: '1' }),
    });
    const next = jasmine.createSpy('next').and.callFake((r: HttpRequest<unknown>) => {
      expect(r.headers.has(SKIP_LOADING_HEADER)).toBe(false);
      return of({} as any);
    });

    TestBed.runInInjectionContext(() => {
      loadingInterceptor(req, next).subscribe(() => {
        expect(loadingServiceSpy.show).not.toHaveBeenCalled();
        expect(loadingServiceSpy.hide).not.toHaveBeenCalled();
        done();
      });
    });
  });
});

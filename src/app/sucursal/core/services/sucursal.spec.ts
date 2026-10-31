import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { SucursalService } from './sucursal.service';

describe('SucursalService', () => {
  let service: SucursalService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(SucursalService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

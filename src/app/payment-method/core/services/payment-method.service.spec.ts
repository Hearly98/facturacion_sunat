import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { PaymentMethodService } from './payment-method.service';

describe('PaymentMethodService', () => {
  let service: PaymentMethodService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(PaymentMethodService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

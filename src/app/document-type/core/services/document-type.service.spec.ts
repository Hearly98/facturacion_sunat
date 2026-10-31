import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { DocumentTypeService } from './document-type.service';

describe('DocumentTypeService', () => {
  let service: DocumentTypeService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(DocumentTypeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

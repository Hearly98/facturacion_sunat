import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { EmissionService } from './emission.service';
import { GetEmissionModel } from '../models/get-emission.model';
import { PageParamsModel } from '@shared/models/query/page-params.model';

describe('EmissionService', () => {
  let service: EmissionService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [EmissionService],
    });
    service = TestBed.inject(EmissionService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('getEmissions', () => {
    it('should fetch emissions with filters', () => {
      const mockEmissions: GetEmissionModel[] = [
        {
          id: 1,
          documentId: 1,
          saleId: 1,
          status: 'enviada',
          serieNumber: 'F001',
          correlativeNumber: '001',
          pdfUrl: 'http://example.com/pdf',
          xmlUrl: 'http://example.com/xml',
          cdrUrl: 'http://example.com/cdr',
          errorMessage: '',
          createdAt: '2024-01-01',
          updatedAt: '2024-01-01',
          customerName: 'John Doe',
          documentNumber: '12345678',
          totalAmount: 100,
        },
      ];

      const mockPagination: PageParamsModel = {
        page: 1,
        limit: 10,
        total: 1,
      } as any;

      const params = { status: 'enviada', page: 1, limit: 10 };

      service.getEmissions(params).subscribe((response) => {
        expect(response.data).toEqual(mockEmissions);
        expect(response.pagination).toEqual(mockPagination);
      });

      const req = httpMock.expectOne((r) =>
        r.url.includes('/api/emissions') && r.params.has('status')
      );
      expect(req.request.method).toBe('GET');
      req.flush({ data: mockEmissions, pagination: mockPagination });
    });

    it('should pass correct query parameters', () => {
      const params = { status: 'error_envio', page: 2, limit: 20 };

      service.getEmissions(params).subscribe();

      const req = httpMock.expectOne((r) => r.url.includes('/api/emissions'));
      expect(req.request.params.get('status')).toBe('error_envio');
      expect(req.request.params.get('page')).toBe('2');
      expect(req.request.params.get('limit')).toBe('20');
      req.flush({ data: [], pagination: { page: 2, limit: 20, total: 0 } });
    });
  });

  describe('downloadPdf', () => {
    it('should download PDF file', () => {
      const mockBlob = new Blob(['PDF content'], { type: 'application/pdf' });
      const emissionId = 1;

      service.downloadPdf(emissionId).subscribe((blob) => {
        expect(blob).toEqual(mockBlob);
        expect(blob.type).toBe('application/pdf');
      });

      const req = httpMock.expectOne(`/api/emissions/${emissionId}/pdf`);
      expect(req.request.method).toBe('GET');
      expect(req.request.responseType).toBe('blob');
      req.flush(mockBlob);
    });
  });

  describe('downloadXml', () => {
    it('should download XML file', () => {
      const mockBlob = new Blob(['<?xml version="1.0"?>'], { type: 'application/xml' });
      const emissionId = 1;

      service.downloadXml(emissionId).subscribe((blob) => {
        expect(blob).toEqual(mockBlob);
        expect(blob.type).toBe('application/xml');
      });

      const req = httpMock.expectOne(`/api/emissions/${emissionId}/xml`);
      expect(req.request.method).toBe('GET');
      expect(req.request.responseType).toBe('blob');
      req.flush(mockBlob);
    });
  });

  describe('downloadCdr', () => {
    it('should download CDR file', () => {
      const mockBlob = new Blob(['CDR content'], { type: 'application/xml' });
      const emissionId = 1;

      service.downloadCdr(emissionId).subscribe((blob) => {
        expect(blob).toEqual(mockBlob);
        expect(blob.type).toBe('application/xml');
      });

      const req = httpMock.expectOne(`/api/emissions/${emissionId}/cdr`);
      expect(req.request.method).toBe('GET');
      expect(req.request.responseType).toBe('blob');
      req.flush(mockBlob);
    });
  });
});

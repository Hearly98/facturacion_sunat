import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { BrandService } from './brand.service';
import { environment } from '@environments/environment';
import { CreateBrand, UpdateBrand } from '../models';
import { BrandDto } from '../dto/brand.dto';
import { ResponseDto } from '@shared/models/api/response.dto';
import { QueryResultsModel } from '@shared/models/query/query-results.model';

describe('BrandService', () => {
  let service: BrandService;
  let httpMock: HttpTestingController;
  const baseUrl = `${environment.apiUrl}/marcas`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [BrandService],
    });
    service = TestBed.inject(BrandService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getAll', () => {
    it('should fetch all brands and map to Brand', () => {
      const mockResponse: ResponseDto<BrandDto[]> = {
        isValid: true,
        data: [
          {
            id: 1,
            empresaId: 1,
            nombre: 'Samsung',
            codigo: 'SAMSUNG',
            activo: true,
            createdAt: '2026-01-01',
            updatedAt: '2026-01-01',
          },
        ],
        messages: [],
      } as any;

      service.getAll().subscribe((response) => {
        expect(response.data.length).toBe(1);
        expect(response.data[0].name).toBe('Samsung');
        expect(response.data[0].code).toBe('SAMSUNG');
        expect(response.data[0].active).toBe(true);
      });

      const req = httpMock.expectOne(`${baseUrl}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  describe('getById', () => {
    it('should fetch a brand by id', () => {
      const mockResponse: ResponseDto<BrandDto> = {
        isValid: true,
        data: {
          id: 1,
          empresaId: 1,
          nombre: 'Samsung',
          codigo: 'SAMSUNG',
          activo: true,
          createdAt: '2026-01-01',
          updatedAt: '2026-01-01',
        },
        messages: [],
      } as any;

      service.getById(1).subscribe((response) => {
        expect(response.data.id).toBe(1);
        expect(response.data.name).toBe('Samsung');
      });

      const req = httpMock.expectOne(`${baseUrl}/1`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  describe('create', () => {
    it('should send nombre/codigo and map the response', () => {
      const createData: CreateBrand = { name: 'Apple', code: 'APPLE' };
      const mockResponse: ResponseDto<BrandDto> = {
        isValid: true,
        data: {
          id: 2,
          empresaId: 1,
          nombre: 'Apple',
          codigo: 'APPLE',
          activo: true,
          createdAt: '2026-01-01',
          updatedAt: '2026-01-01',
        },
        messages: ['Marca creada exitosamente'],
      } as any;

      service.create(createData).subscribe((response) => {
        expect(response.isValid).toBe(true);
        expect(response.data.code).toBe('APPLE');
      });

      const req = httpMock.expectOne(`${baseUrl}/`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ nombre: 'Apple', codigo: 'APPLE' });
      req.flush(mockResponse);
    });
  });

  describe('update', () => {
    it('should send nombre/codigo and map the response', () => {
      const updateData: UpdateBrand = { id: 1, name: 'Samsung Electronics', code: 'SAMSUNG' };
      const mockResponse: ResponseDto<BrandDto> = {
        isValid: true,
        data: {
          id: 1,
          empresaId: 1,
          nombre: 'Samsung Electronics',
          codigo: 'SAMSUNG',
          activo: true,
          createdAt: '2026-01-01',
          updatedAt: '2026-01-01',
        },
        messages: ['Marca actualizada exitosamente'],
      } as any;

      service.update(updateData).subscribe((response) => {
        expect(response.data.name).toBe('Samsung Electronics');
      });

      const req = httpMock.expectOne(`${baseUrl}/`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual({ nombre: 'Samsung Electronics', codigo: 'SAMSUNG' });
      req.flush(mockResponse);
    });
  });

  describe('delete', () => {
    it('should send a DELETE request', () => {
      const mockResponse: ResponseDto<BrandDto | null> = {
        isValid: true,
        data: null,
        messages: [],
      } as any;

      service.delete(1).subscribe((response) => {
        expect(response.isValid).toBe(true);
      });

      const req = httpMock.expectOne(`${baseUrl}/1`);
      expect(req.request.method).toBe('DELETE');
      req.flush(mockResponse);
    });
  });

  describe('search', () => {
    it('should search brands with filters and pagination', () => {
      const searchParams = { filter: { nombre: 'Sam' }, page: { page: 1, pageSize: 10 }, sort: [] };
      const mockResponse: ResponseDto<QueryResultsModel<BrandDto>> = {
        isValid: true,
        data: {
          items: [
            {
              id: 1,
              empresaId: 1,
              nombre: 'Samsung',
              codigo: 'SAMSUNG',
              activo: true,
              createdAt: '2026-01-01',
              updatedAt: '2026-01-01',
            },
          ],
          total: 1,
        } as QueryResultsModel<BrandDto>,
        messages: [],
      } as any;

      service.search(searchParams as any).subscribe((response) => {
        expect(response.data.items.length).toBe(1);
        expect(response.data.total).toBe(1);
        expect(response.data.items[0].code).toBe('SAMSUNG');
      });

      const req = httpMock.expectOne(`${baseUrl}/search`);
      expect(req.request.method).toBe('POST');
      req.flush(mockResponse);
    });
  });
});

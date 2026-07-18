import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { CurrencyService } from './currency.service';
import { environment } from '../../../../environments/environment';
import { Currency, CreateCurrency, UpdateCurrency } from '../models';
import { CurrencyDto, CreateCurrencyDto, UpdateCurrencyDto } from '../dto/currency.dto';
import { ResponseDto } from '../../../shared/models/api/response.dto';
import { QueryResultsModel } from '../../../shared/models/query/query-results.model';

describe('CurrencyService', () => {
  let service: CurrencyService;
  let httpMock: HttpTestingController;
  const baseUrl = `${environment.apiUrl}/monedas`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [CurrencyService],
    });
    service = TestBed.inject(CurrencyService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getAll', () => {
    it('should fetch all currencies', () => {
      const mockResponse: ResponseDto<CurrencyDto[]> = {
        isValid: true,
        data: [
          { id: 1, nombre: 'Dólar', codigo: 'USD', simbolo: '$', est: true } as CurrencyDto,
          { id: 2, nombre: 'Sol', codigo: 'PEN', simbolo: 'S/', est: true } as CurrencyDto,
        ],
        messages: [],
      } as any;

      service.getAll().subscribe((response) => {
        expect(response.data.length).toBe(2);
        expect(response.data[0].code).toBe('USD');
      });

      const req = httpMock.expectOne(`${baseUrl}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  describe('getById', () => {
    it('should fetch a currency by id', () => {
      const currencyId = 1;
      const mockResponse: ResponseDto<CurrencyDto> = {
        isValid: true,
        data: { id: 1, nombre: 'Dólar', codigo: 'USD', simbolo: '$', est: true } as CurrencyDto,
        messages: [],
      } as any;

      service.getById(currencyId).subscribe((response) => {
        expect(response.data.id).toBe(1);
        expect(response.data.code).toBe('USD');
      });

      const req = httpMock.expectOne(`${baseUrl}/${currencyId}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  describe('create', () => {
    it('should create a currency', () => {
      const createData: CreateCurrency = {
        name: 'Euro',
        code: 'EUR',
        symbol: '€',
      };
      const mockResponse: ResponseDto<CurrencyDto> = {
        isValid: true,
        data: { id: 3, nombre: 'Euro', codigo: 'EUR', simbolo: '€', est: true } as CurrencyDto,
        messages: [],
      } as any;

      service.create(createData).subscribe((response) => {
        expect(response.isValid).toBe(true);
        expect(response.data.code).toBe('EUR');
      });

      const req = httpMock.expectOne(`${baseUrl}/`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({
        nombre: 'Euro',
        codigo: 'EUR',
        simbolo: '€',
      });
      req.flush(mockResponse);
    });
  });

  describe('update', () => {
    it('should update a currency', () => {
      const updateData: UpdateCurrency = {
        id: 1,
        name: 'Dólar Estadounidense',
        code: 'USD',
        symbol: 'USD$',
      };
      const mockResponse: ResponseDto<CurrencyDto> = {
        isValid: true,
        data: { id: 1, nombre: 'Dólar Estadounidense', codigo: 'USD', simbolo: 'USD$', est: true } as CurrencyDto,
        messages: ['Moneda actualizada exitosamente'],
      } as any;

      service.update(updateData).subscribe((response) => {
        expect(response.isValid).toBe(true);
        expect(response.data.name).toBe('Dólar Estadounidense');
      });

      const req = httpMock.expectOne(`${baseUrl}/`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual({
        nombre: 'Dólar Estadounidense',
        codigo: 'USD',
        simbolo: 'USD$',
      });
      req.flush(mockResponse);
    });
  });

  describe('delete', () => {
    it('should delete a currency', () => {
      const currencyId = 1;
      const mockResponse: ResponseDto<CurrencyDto | null> = {
        isValid: true,
        data: null,
        messages: [],
      } as any;

      service.delete(currencyId).subscribe((response) => {
        expect(response.isValid).toBe(true);
      });

      const req = httpMock.expectOne(`${baseUrl}/${currencyId}`);
      expect(req.request.method).toBe('DELETE');
      req.flush(mockResponse);
    });
  });

  describe('search', () => {
    it('should search currencies with filters and pagination', () => {
      const pageParams = { page: 1, pageSize: 10 };
      const searchParams = {
        filter: { nombre: 'Dólar' },
        page: pageParams,
        sort: [],
      };
      const mockResponse: ResponseDto<QueryResultsModel<CurrencyDto>> = {
        isValid: true,
        data: {
          items: [
            { id: 1, nombre: 'Dólar', codigo: 'USD', simbolo: '$', est: true } as CurrencyDto,
          ],
          total: 1,
        } as QueryResultsModel<CurrencyDto>,
        messages: [],
      } as any;

      service.search(searchParams).subscribe((response) => {
        expect(response.data.items.length).toBe(1);
        expect(response.data.total).toBe(1);
        expect(response.data.items[0].code).toBe('USD');
      });

      const req = httpMock.expectOne(`${baseUrl}/search`);
      expect(req.request.method).toBe('POST');
      req.flush(mockResponse);
    });
  });
});

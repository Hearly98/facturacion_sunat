import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { CurrencyService } from './currency.service';
import { environment } from '../../../../environments/environment';
import { GetCurrencyModel } from '../models/get-currency.model';
import { CreateCurrencyModel } from '../models/create-currency.model';
import { UpdateCurrencyModel } from '../models/update-currency.model';
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
      const mockResponse: ResponseDto<GetCurrencyModel[]> = {
        isValid: true,
        data: [
          { id: 1, nombre: 'Dólar', codigo: 'USD', simbolo: '$', est: true } as GetCurrencyModel,
          { id: 2, nombre: 'Sol', codigo: 'PEN', simbolo: 'S/', est: true } as GetCurrencyModel,
        ],
        messages: [],
      } as any;

      service.getAll().subscribe((response) => {
        expect(response.data.length).toBe(2);
        expect(response.data[0].codigo).toBe('USD');
      });

      const req = httpMock.expectOne(`${baseUrl}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  describe('getById', () => {
    it('should fetch a currency by id', () => {
      const currencyId = 1;
      const mockResponse: ResponseDto<GetCurrencyModel> = {
        isValid: true,
        data: { id: 1, nombre: 'Dólar', codigo: 'USD', simbolo: '$', est: true } as GetCurrencyModel,
        messages: [],
      } as any;

      service.getById(currencyId).subscribe((response) => {
        expect(response.data.id).toBe(1);
        expect(response.data.codigo).toBe('USD');
      });

      const req = httpMock.expectOne(`${baseUrl}/${currencyId}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  describe('create', () => {
    it('should create a currency', () => {
      const createData: CreateCurrencyModel = {
        nombre: 'Euro',
        codigo: 'EUR',
        simbolo: '€',
      };
      const mockResponse: ResponseDto<GetCurrencyModel> = {
        isValid: true,
        data: { id: 3, nombre: 'Euro', codigo: 'EUR', simbolo: '€', est: true } as GetCurrencyModel,
        messages: [],
      } as any;

      service.create(createData).subscribe((response) => {
        expect(response.isValid).toBe(true);
        expect(response.data.codigo).toBe('EUR');
      });

      const req = httpMock.expectOne(`${baseUrl}/`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(createData);
      req.flush(mockResponse);
    });
  });

  describe('update', () => {
    it('should update a currency', () => {
      const updateData: UpdateCurrencyModel = {
        id: 1,
        nombre: 'Dólar Estadounidense',
        codigo: 'USD',
        simbolo: 'USD$',
      };
      const mockResponse: ResponseDto<GetCurrencyModel> = {
        isValid: true,
        data: { id: 1, nombre: 'Dólar Estadounidense', codigo: 'USD', simbolo: 'USD$', est: true } as GetCurrencyModel,
        messages: ['Moneda actualizada exitosamente'],
      } as any;

      service.update(updateData).subscribe((response) => {
        expect(response.isValid).toBe(true);
        expect(response.data.nombre).toBe('Dólar Estadounidense');
      });

      const req = httpMock.expectOne(`${baseUrl}/`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(updateData);
      req.flush(mockResponse);
    });
  });

  describe('delete', () => {
    it('should delete a currency', () => {
      const currencyId = 1;
      const mockResponse: ResponseDto<GetCurrencyModel> = {
        isValid: true,
        data: {} as GetCurrencyModel,
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
      const mockResponse: ResponseDto<QueryResultsModel<GetCurrencyModel>> = {
        isValid: true,
        data: {
          items: [
            { id: 1, nombre: 'Dólar', codigo: 'USD', simbolo: '$', est: true } as GetCurrencyModel,
          ],
          total: 1,
        } as QueryResultsModel<GetCurrencyModel>,
        messages: [],
      } as any;

      service.search(searchParams).subscribe((response) => {
        expect(response.data.items.length).toBe(1);
        expect(response.data.total).toBe(1);
        expect(response.data.items[0].codigo).toBe('USD');
      });

      const req = httpMock.expectOne(`${baseUrl}/search`);
      expect(req.request.method).toBe('POST');
      req.flush(mockResponse);
    });
  });
});

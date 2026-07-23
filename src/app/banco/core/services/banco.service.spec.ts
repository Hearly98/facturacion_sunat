import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { BancoService } from './banco.service';
import { environment } from '@environments/environment';
import { CreateBanco, UpdateBanco } from '../models';
import { BancoDto } from '../dto/banco.dto';
import { ResponseDto } from '@shared/models/api/response.dto';
import { QueryResultsModel } from '@shared/models/query/query-results.model';

describe('BancoService', () => {
  let service: BancoService;
  let httpMock: HttpTestingController;
  const baseUrl = `${environment.apiUrl}/bancos`;

  const mockDto: BancoDto = {
    id: 1,
    empresaId: 1,
    nombre: 'BCP',
    numeroCuenta: '123456789',
    tipoCuenta: 'CORRIENTE',
    monedaId: 1,
    activo: true,
    createdAt: '2026-01-01',
    updatedAt: '2026-01-01',
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [BancoService],
    });
    service = TestBed.inject(BancoService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getAll', () => {
    it('should fetch all bancos and map camelCase fields to the internal model', () => {
      const mockResponse: ResponseDto<BancoDto[]> = {
        isValid: true,
        data: [mockDto],
        messages: [],
      } as any;

      service.getAll().subscribe((response) => {
        expect(response.data[0].name).toBe('BCP');
        expect(response.data[0].accountNumber).toBe('123456789');
        expect(response.data[0].accountType).toBe('CORRIENTE');
        expect(response.data[0].currencyId).toBe(1);
        expect(response.data[0].active).toBe(true);
      });

      const req = httpMock.expectOne(`${baseUrl}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  describe('getById', () => {
    it('should fetch a banco by id', () => {
      const mockResponse: ResponseDto<BancoDto> = {
        isValid: true,
        data: mockDto,
        messages: [],
      } as any;

      service.getById(1).subscribe((response) => {
        expect(response.data.name).toBe('BCP');
      });

      const req = httpMock.expectOne(`${baseUrl}/1`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  describe('create', () => {
    it('should send the snake_case body the backend validates', () => {
      const createData: CreateBanco = {
        name: 'Interbank',
        accountNumber: '987654321',
        accountType: 'AHORRO',
        currencyId: 2,
      };
      const mockResponse: ResponseDto<BancoDto> = {
        isValid: true,
        data: { ...mockDto, id: 2, nombre: 'Interbank' },
        messages: ['Banco creado exitosamente'],
      } as any;

      service.create(createData).subscribe((response) => {
        expect(response.isValid).toBe(true);
      });

      const req = httpMock.expectOne(`${baseUrl}`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({
        nombre: 'Interbank',
        numero_cuenta: '987654321',
        tipo_cuenta: 'AHORRO',
        moneda_id: 2,
      });
      req.flush(mockResponse);
    });
  });

  describe('update', () => {
    it('should PUT to /bancos/{id} with the snake_case body', () => {
      const updateData: UpdateBanco = {
        id: 1,
        name: 'BCP Cuenta Sueldo',
        accountNumber: '123456789',
        accountType: 'CORRIENTE',
        currencyId: 1,
      };
      const mockResponse: ResponseDto<BancoDto> = {
        isValid: true,
        data: { ...mockDto, nombre: 'BCP Cuenta Sueldo' },
        messages: ['Banco actualizado exitosamente'],
      } as any;

      service.update(updateData).subscribe((response) => {
        expect(response.data.name).toBe('BCP Cuenta Sueldo');
      });

      const req = httpMock.expectOne(`${baseUrl}/1`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual({
        nombre: 'BCP Cuenta Sueldo',
        numero_cuenta: '123456789',
        tipo_cuenta: 'CORRIENTE',
        moneda_id: 1,
      });
      req.flush(mockResponse);
    });
  });

  describe('delete', () => {
    it('should send a DELETE request to /bancos/{id}', () => {
      const mockResponse: ResponseDto<BancoDto | null> = {
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
    it('should search bancos and map each item', () => {
      const mockResponse: ResponseDto<QueryResultsModel<BancoDto>> = {
        isValid: true,
        data: { items: [mockDto], total: 1 } as QueryResultsModel<BancoDto>,
        messages: [],
      } as any;

      service.search({ page: 1, pageSize: 10 } as any).subscribe((response) => {
        expect(response.data.items.length).toBe(1);
        expect(response.data.items[0].name).toBe('BCP');
        expect(response.data.total).toBe(1);
      });

      const req = httpMock.expectOne(`${baseUrl}/search`);
      expect(req.request.method).toBe('POST');
      req.flush(mockResponse);
    });
  });
});

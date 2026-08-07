import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { SerieService } from './serie.service';
import { environment } from 'src/environments/environment';
import { CreateSerie, UpdateSerie } from '../models';
import { SerieDto } from '../dto/serie.dto';
import { ResponseDto } from '@shared/models/api/response.dto';

describe('SerieService', () => {
  let service: SerieService;
  let httpMock: HttpTestingController;
  const baseUrl = `${environment.apiUrl}/series`;

  const mockDto: SerieDto = {
    id: 1,
    empresaId: 1,
    numero: 'F001',
    docCod: 'FAC',
    correlativo: 1,
    activo: true,
    createdAt: '2026-01-01',
    updatedAt: '2026-01-01',
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [SerieService],
    });
    service = TestBed.inject(SerieService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getAll', () => {
    it('should translate numero/docCod/correlativo/activo into the internal model', () => {
      const mockResponse: ResponseDto<SerieDto[]> = {
        isValid: true,
        data: [mockDto],
        messages: [],
      } as any;

      service.getAll().subscribe((response) => {
        expect(response.data[0].number).toBe('F001');
        expect(response.data[0].code).toBe('FAC');
        expect(response.data[0].counter).toBe(1);
        expect(response.data[0].active).toBe(true);
      });

      const req = httpMock.expectOne(`${baseUrl}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  describe('getById', () => {
    it('should fetch a serie by id', () => {
      const mockResponse: ResponseDto<SerieDto> = {
        isValid: true,
        data: mockDto,
        messages: [],
      } as any;

      service.getById(1).subscribe((response) => {
        expect(response.data.number).toBe('F001');
      });

      const req = httpMock.expectOne(`${baseUrl}/1`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  describe('create', () => {
    it('should send ser_num/doc_cod/ser_corr, not the internal English field names', () => {
      const createData: CreateSerie = { code: 'FAC', number: 'F001', counter: 1 };
      const mockResponse: ResponseDto<SerieDto> = {
        isValid: true,
        data: mockDto,
        messages: ['Serie creada exitosamente'],
      } as any;

      service.create(createData).subscribe((response) => {
        expect(response.isValid).toBe(true);
      });

      const req = httpMock.expectOne(`${baseUrl}`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ ser_num: 'F001', doc_cod: 'FAC', ser_corr: 1 });
      req.flush(mockResponse);
    });
  });

  describe('update', () => {
    it('should PUT to /series (no id segment) with the id embedded in the body', () => {
      const updateData: UpdateSerie = { code: 'FAC', number: 'F002', counter: 2 };
      const mockResponse: ResponseDto<SerieDto> = {
        isValid: true,
        data: { ...mockDto, numero: 'F002', correlativo: 2 },
        messages: ['Serie actualizada exitosamente'],
      } as any;

      service.update(1, updateData).subscribe((response) => {
        expect(response.data.number).toBe('F002');
      });

      const req = httpMock.expectOne(`${baseUrl}`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual({ id: 1, ser_num: 'F002', doc_cod: 'FAC', ser_corr: 2 });
      req.flush(mockResponse);
    });
  });

  describe('delete', () => {
    it('should send a DELETE request to /series/{id}', () => {
      const mockResponse: ResponseDto<void> = { isValid: true, data: undefined, messages: [] } as any;

      service.delete(1).subscribe((response) => {
        expect(response.isValid).toBe(true);
      });

      const req = httpMock.expectOne(`${baseUrl}/1`);
      expect(req.request.method).toBe('DELETE');
      req.flush(mockResponse);
    });
  });

  describe('search', () => {
    it('should search series and map each item', () => {
      const mockResponse = {
        isValid: true,
        data: { items: [mockDto], total: 1 },
        messages: [],
      } as any;

      service.search({ page: 1, pageSize: 10 } as any).subscribe((response) => {
        expect(response.data.items.length).toBe(1);
        expect(response.data.items[0].number).toBe('F001');
        expect(response.data.total).toBe(1);
      });

      const req = httpMock.expectOne(`${baseUrl}/search`);
      expect(req.request.method).toBe('POST');
      req.flush(mockResponse);
    });
  });
});

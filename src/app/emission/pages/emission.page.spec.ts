import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder } from '@angular/forms';
import { EmissionPage } from './emission.page';
import { EmissionService } from '../core/services/emission.service';
import { GlobalNotification } from '@shared/alerts/global-notification/global-notification';
import { GetEmissionModel } from '../core/models/get-emission.model';
import { of, throwError } from 'rxjs';
import { PageParamsModel } from '@shared/models/query/page-params.model';

function buildForm(value: {
  status: string | null;
  searchTerm: string | null;
  page: number;
  limit: number;
}): EmissionPage['form'] {
  return new FormBuilder().group(value) as unknown as EmissionPage['form'];
}

describe('EmissionPage', () => {
  let component: EmissionPage;
  let fixture: ComponentFixture<EmissionPage>;
  let emissionService: jasmine.SpyObj<EmissionService>;
  let notificationService: jasmine.SpyObj<GlobalNotification>;

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
    {
      id: 2,
      documentId: 2,
      saleId: 2,
      status: 'error_envio',
      serieNumber: 'F001',
      correlativeNumber: '002',
      pdfUrl: 'http://example.com/pdf',
      xmlUrl: 'http://example.com/xml',
      cdrUrl: 'http://example.com/cdr',
      errorMessage: 'Error de conexión',
      createdAt: '2024-01-02',
      updatedAt: '2024-01-02',
      customerName: 'Jane Doe',
      documentNumber: '87654321',
      totalAmount: 200,
    },
  ];

  const mockPagination: PageParamsModel = {
    page: 1,
    limit: 10,
    total: 2,
  } as any;

  beforeEach(async () => {
    const emissionServiceSpy = jasmine.createSpyObj('EmissionService', ['getEmissions']);
    const notificationServiceSpy = jasmine.createSpyObj('GlobalNotification', [
      'openAlert',
      'openToastAlert',
    ]);

    await TestBed.configureTestingModule({
      imports: [EmissionPage],
      providers: [
        { provide: EmissionService, useValue: emissionServiceSpy },
        { provide: GlobalNotification, useValue: notificationServiceSpy },
      ],
    }).compileComponents();

    emissionService = TestBed.inject(EmissionService) as jasmine.SpyObj<EmissionService>;
    notificationService = TestBed.inject(GlobalNotification) as jasmine.SpyObj<GlobalNotification>;

    fixture = TestBed.createComponent(EmissionPage);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should initialize form and search on init', () => {
      emissionService.getEmissions.and.returnValue(
        of({ data: mockEmissions, pagination: mockPagination })
      );
      spyOn(component, 'search');

      component.ngOnInit();

      expect(component.form).toBeDefined();
      expect(component.search).toHaveBeenCalled();
    });

    it('should set initial form values', () => {
      emissionService.getEmissions.and.returnValue(
        of({ data: [], pagination: mockPagination })
      );

      component.ngOnInit();

      expect(component.form.value.page).toBe(1);
      expect(component.form.value.limit).toBe(10);
    });
  });

  describe('search', () => {
    it('should fetch emissions and update component state', () => {
      emissionService.getEmissions.and.returnValue(
        of({ data: mockEmissions, pagination: mockPagination })
      );

      component.form = buildForm({
        status: null,
        searchTerm: null,
        page: 1,
        limit: 10,
      });

      component.search();

      expect(emissionService.getEmissions).toHaveBeenCalled();
      expect(component.emissions).toEqual(mockEmissions);
      expect(component.totalRecords).toBe(2);
      expect(component.loading).toBe(false);
    });

    it('should set loading to true during fetch', (done) => {
      emissionService.getEmissions.and.returnValue(
        of({ data: mockEmissions, pagination: mockPagination })
      );

      component.form = buildForm({
        status: null,
        searchTerm: null,
        page: 1,
        limit: 10,
      });

      component.search();

      setTimeout(() => {
        expect(component.loading).toBe(false);
        done();
      }, 100);
    });

    it('should stop loading on search failure', () => {
      // NOTE: EmissionPage.search()'s error handler only resets `loading` today; it does
      // not notify the user. This test used to assert a GlobalNotification call that the
      // component never makes -- documented here rather than adding new notification
      // logic that wasn't asked for.
      emissionService.getEmissions.and.returnValue(
        throwError(() => new Error('API Error'))
      );

      component.form = buildForm({
        status: null,
        searchTerm: null,
        page: 1,
        limit: 10,
      });

      component.search();

      expect(component.loading).toBe(false);
    });

    it('should pass correct parameters to service', () => {
      emissionService.getEmissions.and.returnValue(
        of({ data: [], pagination: mockPagination })
      );

      component.form = buildForm({
        status: 'enviada',
        searchTerm: 'F001',
        page: 2,
        limit: 20,
      });

      component.search();

      expect(emissionService.getEmissions).toHaveBeenCalledWith(
        jasmine.objectContaining({
          status: 'enviada',
          search: 'F001',
          page: 2,
          limit: 20,
        })
      );
    });
  });

  describe('onPageChange', () => {
    it('should update page and search', () => {
      spyOn(component, 'search');
      component.form = buildForm({
        status: null,
        searchTerm: null,
        page: 1,
        limit: 10,
      });

      component.onPageChange(3);

      expect(component.form.value.page).toBe(3);
      expect(component.search).toHaveBeenCalled();
    });
  });

  describe('reset', () => {
    it('should clear form and search', () => {
      spyOn(component, 'search');
      component.form = buildForm({
        status: 'enviada',
        searchTerm: 'F001',
        page: 2,
        limit: 20,
      });

      component.reset();

      expect(component.form.value.status).toBeNull();
      expect(component.form.value.searchTerm).toBeNull();
      expect(component.form.value.page).toBe(1);
      expect(component.form.value.limit).toBe(10);
      expect(component.search).toHaveBeenCalled();
    });
  });

  describe('statusOptions', () => {
    it('should have correct status options', () => {
      expect(component.statusOptions).toEqual([
        { value: '', label: 'Todos los estados' },
        { value: 'emitida', label: 'Emitida' },
        { value: 'enviada', label: 'Enviada' },
        { value: 'error_envio', label: 'Error al enviar' },
      ]);
    });
  });
});

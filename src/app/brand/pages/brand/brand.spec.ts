import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { BrandComponent } from './brand';
import { BrandService } from '../../core/services/brand.service';
import { ConfirmService } from '@shared/confirm-modal/core/services/confirm-modal.service';
import { GlobalNotification } from '@shared/alerts/global-notification/global-notification';
import { Brand } from '../../core/models';
import { ResponseDto } from '@shared/models/api/response.dto';
import { QueryResultsModel } from '@shared/models/query/query-results.model';

describe('BrandComponent', () => {
  let component: BrandComponent;
  let fixture: ComponentFixture<BrandComponent>;
  let brandServiceMock: jasmine.SpyObj<BrandService>;
  let confirmServiceMock: jasmine.SpyObj<ConfirmService>;
  let globalNotificationMock: jasmine.SpyObj<GlobalNotification>;

  const mockBrands: Brand[] = [
    {
      id: 1,
      companyId: 1,
      name: 'Samsung',
      code: 'SAMSUNG',
      active: true,
      createdAt: '2026-01-01',
      updatedAt: '2026-01-01',
    },
    {
      id: 2,
      companyId: 1,
      name: 'Apple',
      code: 'APPLE',
      active: true,
      createdAt: '2026-01-01',
      updatedAt: '2026-01-01',
    },
  ];

  const mockSearchResponse: ResponseDto<QueryResultsModel<Brand>> = {
    isValid: true,
    data: { items: mockBrands, total: 2 } as QueryResultsModel<Brand>,
    messages: [],
  } as any;

  beforeEach(async () => {
    brandServiceMock = jasmine.createSpyObj('BrandService', [
      'getAll',
      'getById',
      'create',
      'update',
      'delete',
      'search',
    ]);
    brandServiceMock.search.and.returnValue(of(mockSearchResponse));

    confirmServiceMock = jasmine.createSpyObj('ConfirmService', ['open']);
    globalNotificationMock = jasmine.createSpyObj('GlobalNotification', [
      'openAlert',
      'openToastAlert',
    ]);

    await TestBed.configureTestingModule({
      imports: [BrandComponent, ReactiveFormsModule],
      providers: [
        { provide: BrandService, useValue: brandServiceMock },
        { provide: ConfirmService, useValue: confirmServiceMock },
        { provide: GlobalNotification, useValue: globalNotificationMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(BrandComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should build the filter form and trigger a search', () => {
      fixture.detectChanges();

      expect(component.form).toBeDefined();
      expect(brandServiceMock.search).toHaveBeenCalled();
    });
  });

  describe('createForm', () => {
    it('should expose name and code controls', () => {
      component.createForm();

      expect(component.form.get('name')).toBeDefined();
      expect(component.form.get('code')).toBeDefined();
    });
  });

  describe('onSearch', () => {
    it('should populate brands and total from the search response', () => {
      fixture.detectChanges();

      expect(component.brands.length).toBe(2);
      expect(component.total).toBe(2);
      expect(component.brands[0].code).toBe('SAMSUNG');
    });

    it('should ignore results when the response is invalid', () => {
      brandServiceMock.search.and.returnValue(of({ isValid: false, data: {} } as any));

      fixture.detectChanges();

      expect(component.brands.length).toBe(0);
    });

    it('should notify on search error', () => {
      brandServiceMock.search.and.returnValue(throwError(() => 'network error'));

      fixture.detectChanges();

      expect(globalNotificationMock.openToastAlert).toHaveBeenCalledWith(
        'Error al buscar',
        'network error',
        'danger'
      );
    });
  });

  describe('onPageChange', () => {
    it('should search again with the requested page', () => {
      fixture.detectChanges();
      spyOn(component, 'onSearch');

      component.onPageChange(3);

      expect(component.onSearch).toHaveBeenCalledWith(component.filter, 3);
    });
  });

  describe('onClean', () => {
    it('should reset the form and search again', () => {
      fixture.detectChanges();
      component.form.patchValue({ name: 'Sam' });
      spyOn(component, 'onSearch');

      component.onClean();

      expect(component.form.value.name).toBeNull();
      expect(component.onSearch).toHaveBeenCalled();
    });
  });

  describe('openModal', () => {
    it('should delegate to the modal when present', () => {
      fixture.detectChanges();
      component.brandNewEditModal = jasmine.createSpyObj('BrandNewEditModal', ['openModal']);

      component.openModal(1);

      expect(component.brandNewEditModal.openModal).toHaveBeenCalledWith(1, jasmine.any(Function));
    });

    it('should not throw when the modal is not yet initialized', () => {
      fixture.detectChanges();

      expect(() => component.openModal(1)).not.toThrow();
    });
  });

  describe('onDelete', () => {
    it('should delete the brand and refresh the list on confirmation', (done) => {
      fixture.detectChanges();
      confirmServiceMock.open.and.returnValue(Promise.resolve(true));
      const deleteResponse: ResponseDto<Brand | null> = {
        isValid: true,
        data: null,
        messages: ['Marca eliminada exitosamente'],
      } as any;
      brandServiceMock.delete.and.returnValue(of(deleteResponse));
      spyOn(component, 'onSearch');

      component.onDelete(1);

      setTimeout(() => {
        expect(brandServiceMock.delete).toHaveBeenCalledWith(1);
        expect(globalNotificationMock.openAlert).toHaveBeenCalledWith(deleteResponse);
        expect(component.onSearch).toHaveBeenCalled();
        done();
      }, 100);
    });

    it('should not delete when the user cancels the confirmation', (done) => {
      fixture.detectChanges();
      confirmServiceMock.open.and.returnValue(Promise.resolve(false));

      component.onDelete(1);

      setTimeout(() => {
        expect(brandServiceMock.delete).not.toHaveBeenCalled();
        done();
      }, 100);
    });
  });
});

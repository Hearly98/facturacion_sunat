import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { CurrencyPage } from './currency.page';
import { CurrencyService } from '../core/services/currency.service';
import { CurrencyNewEditModalComponent } from '../components/currency-new-edit-modal.component';
import { ConfirmService } from '@shared/confirm-modal/core/services/confirm-modal.service';
import { GlobalNotification } from '@shared/alerts/global-notification/global-notification';
import { GetCurrencyModel } from '../core/models/get-currency.model';
import { ResponseDto } from '../../shared/models/api/response.dto';
import { QueryResultsModel } from '../../shared/models/query/query-results.model';

describe('CurrencyPage', () => {
  let component: CurrencyPage;
  let fixture: ComponentFixture<CurrencyPage>;
  let currencyServiceMock: jasmine.SpyObj<CurrencyService>;
  let confirmServiceMock: jasmine.SpyObj<ConfirmService>;
  let globalNotificationMock: jasmine.SpyObj<GlobalNotification>;

  const mockCurrencies: GetCurrencyModel[] = [
    { id: 1, nombre: 'Dólar', codigo: 'USD', simbolo: '$', est: true } as GetCurrencyModel,
    { id: 2, nombre: 'Sol', codigo: 'PEN', simbolo: 'S/', est: true } as GetCurrencyModel,
  ];

  const mockSearchResponse: ResponseDto<QueryResultsModel<GetCurrencyModel>> = {
    isValid: true,
    data: {
      items: mockCurrencies,
      total: 2,
    } as QueryResultsModel<GetCurrencyModel>,
    messages: [],
  } as any;

  beforeEach(async () => {
    currencyServiceMock = jasmine.createSpyObj('CurrencyService', [
      'getAll',
      'getById',
      'create',
      'update',
      'delete',
      'search',
    ]);
    currencyServiceMock.search.and.returnValue(of(mockSearchResponse));

    confirmServiceMock = jasmine.createSpyObj('ConfirmService', ['open']);
    globalNotificationMock = jasmine.createSpyObj('GlobalNotification', [
      'openAlert',
      'openToastAlert',
    ]);

    await TestBed.configureTestingModule({
      imports: [CurrencyPage, ReactiveFormsModule],
      providers: [
        { provide: CurrencyService, useValue: currencyServiceMock },
        { provide: ConfirmService, useValue: confirmServiceMock },
        { provide: GlobalNotification, useValue: globalNotificationMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CurrencyPage);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should initialize form and call onSearch', () => {
      spyOn(component, 'onSearch');
      fixture.detectChanges();

      expect(component.form).toBeDefined();
      expect(component.onSearch).toHaveBeenCalled();
    });
  });

  describe('createForm', () => {
    it('should create filter form', () => {
      component.createForm();

      expect(component.form).toBeDefined();
      expect(component.form.get('order')).toBeDefined();
    });
  });

  describe('onSearch', () => {
    it('should call service.search and update currencies list', (done) => {
      fixture.detectChanges();

      currencyServiceMock.search.and.returnValue(of(mockSearchResponse));
      component.onSearch();

      setTimeout(() => {
        expect(currencyServiceMock.search).toHaveBeenCalled();
        expect(component.currencies.length).toBe(2);
        expect(component.total).toBe(2);
        expect(component.currencies[0].codigo).toBe('USD');
        done();
      }, 100);
    });

    it('should handle search error', (done) => {
      fixture.detectChanges();

      const errorResponse = { isValid: false, messages: ['Error en búsqueda'] };
      currencyServiceMock.search.and.returnValue(of(errorResponse as any));

      spyOn(console, 'error');
      component.onSearch();

      setTimeout(() => {
        expect(console.error).toHaveBeenCalled();
        done();
      }, 100);
    });

    it('should update pagination and filter values', () => {
      fixture.detectChanges();
      const filter = { nombre: 'Dólar' };

      component.onSearch(filter, 2);

      expect(component.page.page).toBe(2);
      expect(currencyServiceMock.search).toHaveBeenCalled();
    });
  });

  describe('onPageChange', () => {
    it('should call onSearch with new page number', () => {
      spyOn(component, 'onSearch');
      fixture.detectChanges();

      component.onPageChange(3);

      expect(component.onSearch).toHaveBeenCalledWith(component.filter, 3);
    });
  });

  describe('onClean', () => {
    it('should reset form and call onSearch', () => {
      fixture.detectChanges();
      spyOn(component, 'onSearch');
      component.form.patchValue({ nombre: 'Test' });

      component.onClean();

      expect(component.form.value.order).toBe('desc');
      expect(component.onSearch).toHaveBeenCalled();
    });
  });

  describe('openModal', () => {
    it('should call modal.openModal with id when editing', () => {
      fixture.detectChanges();
      component.currencyNewEditModal = jasmine.createSpyObj('CurrencyNewEditModalComponent', [
        'openModal',
      ]);

      component.openModal(1);

      expect(component.currencyNewEditModal.openModal).toHaveBeenCalledWith(
        1,
        jasmine.any(Function)
      );
    });

    it('should call modal.openModal without id when creating', () => {
      fixture.detectChanges();
      component.currencyNewEditModal = jasmine.createSpyObj('CurrencyNewEditModalComponent', [
        'openModal',
      ]);

      component.openModal();

      expect(component.currencyNewEditModal.openModal).toHaveBeenCalledWith(
        undefined,
        jasmine.any(Function)
      );
    });

    it('should not throw if modal is not initialized', () => {
      fixture.detectChanges();

      expect(() => component.openModal(1)).not.toThrow();
    });
  });

  describe('onDelete', () => {
    it('should delete currency on confirmation', (done) => {
      fixture.detectChanges();
      confirmServiceMock.open.and.returnValue(Promise.resolve(true));
      const deleteResponse: ResponseDto<GetCurrencyModel> = {
        isValid: true,
        data: {} as GetCurrencyModel,
        messages: ['Moneda eliminada exitosamente'],
      } as any;
      currencyServiceMock.delete.and.returnValue(of(deleteResponse));
      spyOn(component, 'onSearch');

      component.onDelete(1);

      setTimeout(() => {
        expect(confirmServiceMock.open).toHaveBeenCalled();
        expect(currencyServiceMock.delete).toHaveBeenCalledWith(1);
        expect(globalNotificationMock.openAlert).toHaveBeenCalled();
        expect(component.onSearch).toHaveBeenCalled();
        done();
      }, 100);
    });

    it('should not delete on cancellation', (done) => {
      fixture.detectChanges();
      confirmServiceMock.open.and.returnValue(Promise.resolve(false));

      component.onDelete(1);

      setTimeout(() => {
        expect(currencyServiceMock.delete).not.toHaveBeenCalled();
        done();
      }, 100);
    });

    it('should handle delete error', (done) => {
      fixture.detectChanges();
      confirmServiceMock.open.and.returnValue(Promise.resolve(true));
      const error = new Error('Delete failed');
      currencyServiceMock.delete.and.returnValue(throwError(() => error));

      component.onDelete(1);

      setTimeout(() => {
        expect(globalNotificationMock.openToastAlert).toHaveBeenCalled();
        done();
      }, 100);
    });

    it('should handle invalid response on delete', (done) => {
      fixture.detectChanges();
      confirmServiceMock.open.and.returnValue(Promise.resolve(true));
      const invalidResponse: ResponseDto<GetCurrencyModel> = {
        isValid: false,
        data: {} as GetCurrencyModel,
        messages: ['Error al eliminar'],
      } as any;
      currencyServiceMock.delete.and.returnValue(of(invalidResponse));
      spyOn(component, 'onSearch');

      component.onDelete(1);

      setTimeout(() => {
        expect(globalNotificationMock.openAlert).toHaveBeenCalledWith(invalidResponse);
        expect(component.onSearch).not.toHaveBeenCalled();
        done();
      }, 100);
    });
  });
});

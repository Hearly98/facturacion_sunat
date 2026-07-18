import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { CurrencyNewEditModalComponent } from './currency-new-edit-modal.component';
import { CurrencyService } from '../core/services/currency.service';
import { GlobalNotification } from '../../shared/alerts/global-notification/global-notification';
import { GetCurrencyModel } from '../core/models/get-currency.model';
import { ResponseDto } from '../../shared/models/api/response.dto';

describe('CurrencyNewEditModalComponent', () => {
  let component: CurrencyNewEditModalComponent;
  let fixture: ComponentFixture<CurrencyNewEditModalComponent>;
  let currencyServiceMock: jasmine.SpyObj<CurrencyService>;
  let globalNotificationMock: jasmine.SpyObj<GlobalNotification>;

  const mockCurrency: GetCurrencyModel = {
    id: 1,
    nombre: 'Dólar',
    codigo: 'USD',
    simbolo: '$',
    est: true,
  } as GetCurrencyModel;

  beforeEach(async () => {
    currencyServiceMock = jasmine.createSpyObj('CurrencyService', [
      'getById',
      'create',
      'update',
    ]);
    globalNotificationMock = jasmine.createSpyObj('GlobalNotification', ['openAlert']);

    await TestBed.configureTestingModule({
      imports: [CurrencyNewEditModalComponent, ReactiveFormsModule],
      providers: [
        { provide: CurrencyService, useValue: currencyServiceMock },
        { provide: GlobalNotification, useValue: globalNotificationMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CurrencyNewEditModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should create form on init', () => {
      expect(component.form).toBeDefined();
      expect(component.form.get('nombre')).toBeDefined();
      expect(component.form.get('codigo')).toBeDefined();
      expect(component.form.get('simbolo')).toBeDefined();
    });
  });

  describe('openModal - Create mode', () => {
    it('should open modal in create mode', () => {
      component.openModal();

      expect(component.title()).toBe('Crear Moneda');
      expect(component.visible).toBe(true);
      expect(component.form.get('id')?.value).toBeNull();
    });

    it('should accept callback function', () => {
      const callback = jasmine.createSpy('callback');

      component.openModal(undefined, callback);

      expect(component.callback).toBe(callback);
    });

    it('should reset form when opening new', () => {
      component.form.patchValue({
        id: 1,
        nombre: 'Dólar',
        codigo: 'USD',
        simbolo: '$',
      });

      component.openModal();

      expect(component.form.get('id')?.value).toBeNull();
    });
  });

  describe('openModal - Edit mode', () => {
    it('should open modal in edit mode when id is provided', () => {
      currencyServiceMock.getById.and.returnValue(
        of({ isValid: true, data: mockCurrency } as any)
      );

      component.openModal(1);

      expect(component.title()).toBe('Editar Moneda');
      expect(component.visible).toBe(true);
      expect(currencyServiceMock.getById).toHaveBeenCalledWith(1);
    });
  });

  describe('loadData', () => {
    it('should load currency data by id', () => {
      currencyServiceMock.getById.and.returnValue(
        of({ isValid: true, data: mockCurrency } as any)
      );

      component.loadData(1);

      expect(currencyServiceMock.getById).toHaveBeenCalledWith(1);
      expect(component.form.get('nombre')?.value).toBe('Dólar');
      expect(component.form.get('codigo')?.value).toBe('USD');
    });

    it('should handle error when loading data', () => {
      currencyServiceMock.getById.and.returnValue(
        of({ isValid: false, data: {} } as any)
      );

      component.loadData(1);

      expect(component.form.get('nombre')?.value).toBeNull();
    });
  });

  describe('onClose', () => {
    it('should close modal', () => {
      component.visible = true;

      component.onClose();

      expect(component.visible).toBe(false);
    });
  });

  describe('onSubmit', () => {
    it('should not submit invalid form', () => {
      spyOn(component, 'create');
      spyOn(component, 'update');
      component.form.reset();

      component.onSubmit();

      expect(component.create).not.toHaveBeenCalled();
      expect(component.update).not.toHaveBeenCalled();
    });

    it('should mark all fields as touched on invalid form', () => {
      spyOn(component.form, 'markAllAsTouched');
      component.form.reset();

      component.onSubmit();

      expect(component.form.markAllAsTouched).toHaveBeenCalled();
    });

    it('should call create when form is valid and no id', () => {
      spyOn(component, 'create');
      component.form.patchValue({
        nombre: 'Euro',
        codigo: 'EUR',
        simbolo: '€',
      });

      component.onSubmit();

      expect(component.create).toHaveBeenCalled();
    });

    it('should call update when form is valid and has id', () => {
      spyOn(component, 'update');
      component.form.patchValue({
        id: 1,
        nombre: 'Dólar Actualizado',
        codigo: 'USD',
        simbolo: '$',
      });

      component.onSubmit();

      expect(component.update).toHaveBeenCalled();
    });
  });

  describe('create', () => {
    it('should create currency successfully', (done) => {
      const createResponse: ResponseDto<GetCurrencyModel> = {
        isValid: true,
        data: { id: 3, nombre: 'Euro', codigo: 'EUR', simbolo: '€', est: true } as GetCurrencyModel,
        messages: ['Moneda creada exitosamente'],
      } as any;
      currencyServiceMock.create.and.returnValue(of(createResponse));
      const callback = jasmine.createSpy('callback');

      component.form.patchValue({
        nombre: 'Euro',
        codigo: 'EUR',
        simbolo: '€',
      });
      component.callback = callback;
      component.create();

      setTimeout(() => {
        expect(currencyServiceMock.create).toHaveBeenCalled();
        expect(globalNotificationMock.openAlert).toHaveBeenCalledWith(createResponse);
        expect(callback).toHaveBeenCalledWith(createResponse.data);
        expect(component.visible).toBe(false);
        expect(component.isLoading()).toBe(false);
        done();
      }, 100);
    });

    it('should handle create error', (done) => {
      const error = { error: { isValid: false, messages: ['Error al crear'] } };
      currencyServiceMock.create.and.returnValue(throwError(() => error));
      const callback = jasmine.createSpy('callback');

      component.form.patchValue({
        nombre: 'Euro',
        codigo: 'EUR',
        simbolo: '€',
      });
      component.callback = callback;
      component.create();

      setTimeout(() => {
        expect(globalNotificationMock.openAlert).toHaveBeenCalled();
        expect(callback).not.toHaveBeenCalled();
        expect(component.isLoading()).toBe(false);
        done();
      }, 100);
    });

    it('should handle invalid response on create', (done) => {
      const invalidResponse: ResponseDto<GetCurrencyModel> = {
        isValid: false,
        data: {} as GetCurrencyModel,
        messages: ['Código duplicado'],
      } as any;
      currencyServiceMock.create.and.returnValue(of(invalidResponse));
      const callback = jasmine.createSpy('callback');

      component.form.patchValue({
        nombre: 'Euro',
        codigo: 'EUR',
        simbolo: '€',
      });
      component.callback = callback;
      component.create();

      setTimeout(() => {
        expect(globalNotificationMock.openAlert).toHaveBeenCalledWith(invalidResponse);
        expect(callback).not.toHaveBeenCalled();
        done();
      }, 100);
    });
  });

  describe('update', () => {
    it('should update currency successfully', (done) => {
      const updateResponse: ResponseDto<GetCurrencyModel> = {
        isValid: true,
        data: { id: 1, nombre: 'Dólar Actualizado', codigo: 'USD', simbolo: 'USD$', est: true } as GetCurrencyModel,
        messages: ['Moneda actualizada exitosamente'],
      } as any;
      currencyServiceMock.update.and.returnValue(of(updateResponse));
      const callback = jasmine.createSpy('callback');

      component.form.patchValue({
        id: 1,
        nombre: 'Dólar Actualizado',
        codigo: 'USD',
        simbolo: 'USD$',
      });
      component.callback = callback;
      component.update();

      setTimeout(() => {
        expect(currencyServiceMock.update).toHaveBeenCalled();
        expect(globalNotificationMock.openAlert).toHaveBeenCalledWith(updateResponse);
        expect(callback).toHaveBeenCalledWith(updateResponse.data);
        expect(component.visible).toBe(false);
        expect(component.isLoading()).toBe(false);
        done();
      }, 100);
    });

    it('should handle update error', (done) => {
      const error = { error: { isValid: false, messages: ['Error al actualizar'] } };
      currencyServiceMock.update.and.returnValue(throwError(() => error));
      const callback = jasmine.createSpy('callback');

      component.form.patchValue({
        id: 1,
        nombre: 'Dólar',
        codigo: 'USD',
        simbolo: '$',
      });
      component.callback = callback;
      component.update();

      setTimeout(() => {
        expect(globalNotificationMock.openAlert).toHaveBeenCalled();
        expect(callback).not.toHaveBeenCalled();
        expect(component.isLoading()).toBe(false);
        done();
      }, 100);
    });

    it('should handle invalid response on update', (done) => {
      const invalidResponse: ResponseDto<GetCurrencyModel> = {
        isValid: false,
        data: {} as GetCurrencyModel,
        messages: ['Código duplicado'],
      } as any;
      currencyServiceMock.update.and.returnValue(of(invalidResponse));
      const callback = jasmine.createSpy('callback');

      component.form.patchValue({
        id: 1,
        nombre: 'Dólar',
        codigo: 'USD',
        simbolo: '$',
      });
      component.callback = callback;
      component.update();

      setTimeout(() => {
        expect(globalNotificationMock.openAlert).toHaveBeenCalledWith(invalidResponse);
        expect(callback).not.toHaveBeenCalled();
        done();
      }, 100);
    });
  });
});

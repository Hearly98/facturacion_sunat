import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { BancoNewEditModal } from './banco-new-edit-modal';
import { BancoService } from '../../core/services/banco.service';
import { GlobalNotification } from '@shared/alerts/global-notification/global-notification';
import { CurrencyService } from 'src/app/currency/core/services/currency.service';
import { Banco } from '../../core/models';
import { Currency } from 'src/app/currency/core/models/currency.model';
import { ResponseDto } from '@shared/models/api/response.dto';

describe('BancoNewEditModal', () => {
  let component: BancoNewEditModal;
  let fixture: ComponentFixture<BancoNewEditModal>;
  let bancoServiceMock: jasmine.SpyObj<BancoService>;
  let globalNotificationMock: jasmine.SpyObj<GlobalNotification>;
  let currencyServiceMock: jasmine.SpyObj<CurrencyService>;

  const mockBanco: Banco = {
    id: 1,
    companyId: 1,
    name: 'BCP',
    accountNumber: '123456789',
    accountType: 'CORRIENTE',
    currencyId: 1,
    active: true,
    createdAt: '2026-01-01',
    updatedAt: '2026-01-01',
  };

  const mockCurrencies: Currency[] = [
    { id: 1, name: 'Sol', code: 'PEN', symbol: 'S/', active: true },
    { id: 2, name: 'Dólar', code: 'USD', symbol: '$', active: true },
  ];

  beforeEach(async () => {
    bancoServiceMock = jasmine.createSpyObj('BancoService', ['getById', 'create', 'update']);
    globalNotificationMock = jasmine.createSpyObj('GlobalNotification', [
      'openAlert',
      'openToastAlert',
    ]);
    currencyServiceMock = jasmine.createSpyObj('CurrencyService', ['getAll']);
    currencyServiceMock.getAll.and.returnValue(of({ isValid: true, data: mockCurrencies } as any));

    await TestBed.configureTestingModule({
      imports: [BancoNewEditModal, ReactiveFormsModule],
      providers: [
        { provide: BancoService, useValue: bancoServiceMock },
        { provide: GlobalNotification, useValue: globalNotificationMock },
        { provide: CurrencyService, useValue: currencyServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(BancoNewEditModal);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should build the form and load the currency combo', () => {
      fixture.detectChanges();

      expect(component.form).toBeDefined();
      expect(currencyServiceMock.getAll).toHaveBeenCalled();
      expect(component.currencies.length).toBe(2);
    });
  });

  describe('openModal - create mode', () => {
    it('should set the title and reset the form', () => {
      fixture.detectChanges();

      component.openModal();

      expect(component.title()).toBe('Crear Banco');
      expect(component.visible).toBe(true);
      expect(component.form.get('id')?.value).toBeNull();
    });

    it('should store the callback', () => {
      fixture.detectChanges();
      const callback = jasmine.createSpy('callback');

      component.openModal(undefined, callback);

      expect(component.callback).toBe(callback);
    });
  });

  describe('openModal - edit mode', () => {
    it('should set the title and load the banco', () => {
      fixture.detectChanges();
      bancoServiceMock.getById.and.returnValue(of({ isValid: true, data: mockBanco } as any));

      component.openModal(1);

      expect(component.title()).toBe('Editar Banco');
      expect(bancoServiceMock.getById).toHaveBeenCalledWith(1);
    });
  });

  describe('loadData', () => {
    it('should patch the form with the fetched banco', () => {
      fixture.detectChanges();
      bancoServiceMock.getById.and.returnValue(of({ isValid: true, data: mockBanco } as any));

      component.loadData(1);

      expect(component.form.get('name')?.value).toBe('BCP');
      expect(component.form.get('accountNumber')?.value).toBe('123456789');
      expect(component.form.get('accountType')?.value).toBe('CORRIENTE');
      expect(component.form.get('currencyId')?.value).toBe(1);
    });

    it('should leave the form untouched when the response is invalid', () => {
      fixture.detectChanges();
      bancoServiceMock.getById.and.returnValue(of({ isValid: false, data: {} } as any));

      component.loadData(1);

      expect(component.form.get('name')?.value).toBeNull();
    });
  });

  describe('onClose', () => {
    it('should hide the modal', () => {
      fixture.detectChanges();
      component.visible = true;

      component.onClose();

      expect(component.visible).toBe(false);
    });
  });

  describe('onSubmit', () => {
    it('should mark fields touched and not submit an invalid form', () => {
      fixture.detectChanges();
      spyOn(component, 'create');
      spyOn(component, 'update');
      component.form.reset();

      component.onSubmit();

      expect(component.create).not.toHaveBeenCalled();
      expect(component.update).not.toHaveBeenCalled();
    });

    it('should call create for a new banco', () => {
      fixture.detectChanges();
      spyOn(component, 'create');
      component.form.patchValue({
        name: 'BCP',
        accountNumber: '123456789',
        accountType: 'CORRIENTE',
        currencyId: 1,
      });

      component.onSubmit();

      expect(component.create).toHaveBeenCalled();
    });

    it('should call update when the form has an id', () => {
      fixture.detectChanges();
      spyOn(component, 'update');
      component.form.patchValue({
        id: 1,
        name: 'BCP',
        accountNumber: '123456789',
        accountType: 'CORRIENTE',
        currencyId: 1,
      });

      component.onSubmit();

      expect(component.update).toHaveBeenCalled();
    });
  });

  describe('create', () => {
    it('should create the banco and invoke the callback', (done) => {
      fixture.detectChanges();
      const response: ResponseDto<Banco> = {
        isValid: true,
        data: mockBanco,
        messages: ['Banco creado exitosamente'],
      } as any;
      bancoServiceMock.create.and.returnValue(of(response));
      const callback = jasmine.createSpy('callback');

      component.form.patchValue({
        name: 'BCP',
        accountNumber: '123456789',
        accountType: 'CORRIENTE',
        currencyId: 1,
      });
      component.callback = callback;
      component.create();

      setTimeout(() => {
        expect(bancoServiceMock.create).toHaveBeenCalled();
        expect(globalNotificationMock.openAlert).toHaveBeenCalledWith(response);
        expect(callback).toHaveBeenCalled();
        expect(component.visible).toBe(false);
        expect(component.isLoading()).toBe(false);
        done();
      }, 100);
    });

    it('should surface a toast on error without invoking the callback', (done) => {
      fixture.detectChanges();
      bancoServiceMock.create.and.returnValue(throwError(() => ({ message: 'Error al crear' })));
      const callback = jasmine.createSpy('callback');

      component.form.patchValue({
        name: 'BCP',
        accountNumber: '123456789',
        accountType: 'CORRIENTE',
        currencyId: 1,
      });
      component.callback = callback;
      component.create();

      setTimeout(() => {
        expect(globalNotificationMock.openToastAlert).toHaveBeenCalledWith(
          'Error',
          'Error al crear',
          'danger'
        );
        expect(callback).not.toHaveBeenCalled();
        expect(component.isLoading()).toBe(false);
        done();
      }, 100);
    });
  });

  describe('update', () => {
    it('should update the banco and invoke the callback', (done) => {
      fixture.detectChanges();
      const response: ResponseDto<Banco> = {
        isValid: true,
        data: { ...mockBanco, name: 'BCP Cuenta Sueldo' },
        messages: ['Banco actualizado exitosamente'],
      } as any;
      bancoServiceMock.update.and.returnValue(of(response));
      const callback = jasmine.createSpy('callback');

      component.form.patchValue({
        id: 1,
        name: 'BCP Cuenta Sueldo',
        accountNumber: '123456789',
        accountType: 'CORRIENTE',
        currencyId: 1,
      });
      component.callback = callback;
      component.update();

      setTimeout(() => {
        expect(bancoServiceMock.update).toHaveBeenCalled();
        expect(globalNotificationMock.openAlert).toHaveBeenCalledWith(response);
        expect(callback).toHaveBeenCalled();
        expect(component.visible).toBe(false);
        done();
      }, 100);
    });
  });
});

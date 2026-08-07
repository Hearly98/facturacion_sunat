import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { BrandNewEditModal } from './brand-new-edit-modal';
import { BrandService } from '../../core/services/brand.service';
import { GlobalNotification } from '@shared/alerts/global-notification/global-notification';
import { Brand } from '../../core/models';
import { ResponseDto } from '@shared/models/api/response.dto';

describe('BrandNewEditModal', () => {
  let component: BrandNewEditModal;
  let fixture: ComponentFixture<BrandNewEditModal>;
  let brandServiceMock: jasmine.SpyObj<BrandService>;
  let globalNotificationMock: jasmine.SpyObj<GlobalNotification>;

  const mockBrand: Brand = {
    id: 1,
    companyId: 1,
    name: 'Samsung',
    code: 'SAMSUNG',
    active: true,
    createdAt: '2026-01-01',
    updatedAt: '2026-01-01',
  };

  beforeEach(async () => {
    brandServiceMock = jasmine.createSpyObj('BrandService', ['getById', 'create', 'update']);
    globalNotificationMock = jasmine.createSpyObj('GlobalNotification', ['openAlert']);

    await TestBed.configureTestingModule({
      imports: [BrandNewEditModal, ReactiveFormsModule],
      providers: [
        { provide: BrandService, useValue: brandServiceMock },
        { provide: GlobalNotification, useValue: globalNotificationMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(BrandNewEditModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should create the form with name and code controls', () => {
      expect(component.form).toBeDefined();
      expect(component.form.get('name')).toBeDefined();
      expect(component.form.get('code')).toBeDefined();
    });
  });

  describe('openModal - create mode', () => {
    it('should set title to Crear Marca and reset the form', () => {
      component.openModal();

      expect(component.title()).toBe('Crear Marca');
      expect(component.visible).toBe(true);
      expect(component.form.get('id')?.value).toBeNull();
    });

    it('should store the callback', () => {
      const callback = jasmine.createSpy('callback');

      component.openModal(undefined, callback);

      expect(component.callback).toBe(callback);
    });
  });

  describe('openModal - edit mode', () => {
    it('should set title to Editar Marca and load data', () => {
      brandServiceMock.getById.and.returnValue(of({ isValid: true, data: mockBrand } as any));

      component.openModal(1);

      expect(component.title()).toBe('Editar Marca');
      expect(brandServiceMock.getById).toHaveBeenCalledWith(1);
    });
  });

  describe('loadData', () => {
    it('should patch the form with the fetched brand', () => {
      brandServiceMock.getById.and.returnValue(of({ isValid: true, data: mockBrand } as any));

      component.loadData(1);

      expect(component.form.get('name')?.value).toBe('Samsung');
      expect(component.form.get('code')?.value).toBe('SAMSUNG');
    });

    it('should not patch the form when the response is invalid', () => {
      brandServiceMock.getById.and.returnValue(of({ isValid: false, data: {} } as any));

      component.loadData(1);

      expect(component.form.get('name')?.value).toBeNull();
    });
  });

  describe('onClose', () => {
    it('should hide the modal', () => {
      component.visible = true;

      component.onClose();

      expect(component.visible).toBe(false);
    });
  });

  describe('onSubmit', () => {
    it('should mark all fields touched and not submit an invalid form', () => {
      spyOn(component, 'create');
      spyOn(component, 'update');
      spyOn(component.form, 'markAllAsTouched');
      component.form.reset();

      component.onSubmit();

      expect(component.form.markAllAsTouched).toHaveBeenCalled();
      expect(component.create).not.toHaveBeenCalled();
      expect(component.update).not.toHaveBeenCalled();
    });

    it('should call create when the form is valid and has no id', () => {
      spyOn(component, 'create');
      component.form.patchValue({ name: 'Apple', code: 'APPLE' });

      component.onSubmit();

      expect(component.create).toHaveBeenCalled();
    });

    it('should call update when the form is valid and has an id', () => {
      spyOn(component, 'update');
      component.form.patchValue({ id: 1, name: 'Samsung', code: 'SAMSUNG' });

      component.onSubmit();

      expect(component.update).toHaveBeenCalled();
    });
  });

  describe('create', () => {
    it('should create the brand and invoke the callback', (done) => {
      const response: ResponseDto<Brand> = {
        isValid: true,
        data: { ...mockBrand, id: 2, name: 'Apple', code: 'APPLE' },
        messages: ['Marca creada exitosamente'],
      } as any;
      brandServiceMock.create.and.returnValue(of(response));
      const callback = jasmine.createSpy('callback');

      component.form.patchValue({ name: 'Apple', code: 'APPLE' });
      component.callback = callback;
      component.create();

      setTimeout(() => {
        expect(brandServiceMock.create).toHaveBeenCalled();
        expect(globalNotificationMock.openAlert).toHaveBeenCalledWith(response);
        expect(callback).toHaveBeenCalledWith(response.data);
        expect(component.visible).toBe(false);
        expect(component.isLoading()).toBe(false);
        done();
      }, 100);
    });

    it('should surface errors without invoking the callback', (done) => {
      const error = { message: 'Error al crear' };
      brandServiceMock.create.and.returnValue(throwError(() => error));
      const callback = jasmine.createSpy('callback');

      component.form.patchValue({ name: 'Apple', code: 'APPLE' });
      component.callback = callback;
      component.create();

      setTimeout(() => {
        expect(globalNotificationMock.openAlert).toHaveBeenCalledWith('Error al crear');
        expect(callback).not.toHaveBeenCalled();
        expect(component.isLoading()).toBe(false);
        done();
      }, 100);
    });
  });

  describe('update', () => {
    it('should update the brand and invoke the callback', (done) => {
      const response: ResponseDto<Brand> = {
        isValid: true,
        data: { ...mockBrand, name: 'Samsung Electronics' },
        messages: ['Marca actualizada exitosamente'],
      } as any;
      brandServiceMock.update.and.returnValue(of(response));
      const callback = jasmine.createSpy('callback');

      component.form.patchValue({ id: 1, name: 'Samsung Electronics', code: 'SAMSUNG' });
      component.callback = callback;
      component.update();

      setTimeout(() => {
        expect(brandServiceMock.update).toHaveBeenCalled();
        expect(globalNotificationMock.openAlert).toHaveBeenCalledWith(response);
        expect(callback).toHaveBeenCalledWith(response.data);
        expect(component.visible).toBe(false);
        done();
      }, 100);
    });
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { BancoComponent } from './banco';
import { BancoService } from '../../core/services/banco.service';
import { ConfirmService } from '@shared/confirm-modal/core/services/confirm-modal.service';
import { GlobalNotification } from '@shared/alerts/global-notification/global-notification';
import { Banco } from '../../core/models';
import { ResponseDto } from '@shared/models/api/response.dto';
import { QueryResultsModel } from '@shared/models/query/query-results.model';

describe('BancoComponent', () => {
  let component: BancoComponent;
  let fixture: ComponentFixture<BancoComponent>;
  let bancoServiceMock: jasmine.SpyObj<BancoService>;
  let confirmServiceMock: jasmine.SpyObj<ConfirmService>;
  let globalNotificationMock: jasmine.SpyObj<GlobalNotification>;

  const mockBancos: Banco[] = [
    {
      id: 1,
      companyId: 1,
      name: 'BCP',
      accountNumber: '123456789',
      accountType: 'CORRIENTE',
      currencyId: 1,
      active: true,
      createdAt: '2026-01-01',
      updatedAt: '2026-01-01',
    },
  ];

  const mockSearchResponse: ResponseDto<QueryResultsModel<Banco>> = {
    isValid: true,
    data: { items: mockBancos, total: 1 } as QueryResultsModel<Banco>,
    messages: [],
  } as any;

  beforeEach(async () => {
    bancoServiceMock = jasmine.createSpyObj('BancoService', [
      'getAll',
      'getById',
      'create',
      'update',
      'delete',
      'search',
    ]);
    bancoServiceMock.search.and.returnValue(of(mockSearchResponse));

    confirmServiceMock = jasmine.createSpyObj('ConfirmService', ['open']);
    globalNotificationMock = jasmine.createSpyObj('GlobalNotification', [
      'openAlert',
      'openToastAlert',
    ]);

    await TestBed.configureTestingModule({
      imports: [BancoComponent, ReactiveFormsModule],
      providers: [
        { provide: BancoService, useValue: bancoServiceMock },
        { provide: ConfirmService, useValue: confirmServiceMock },
        { provide: GlobalNotification, useValue: globalNotificationMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(BancoComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should build the filter form and search on init', () => {
      fixture.detectChanges();

      expect(component.form).toBeDefined();
      expect(bancoServiceMock.search).toHaveBeenCalled();
      expect(component.bancos.length).toBe(1);
      expect(component.total).toBe(1);
    });
  });

  describe('createForm', () => {
    it('should expose name and accountNumber controls', () => {
      component.createForm();

      expect(component.form.get('name')).toBeDefined();
      expect(component.form.get('accountNumber')).toBeDefined();
    });
  });

  describe('onSearch', () => {
    it('should ignore results when the response is invalid', () => {
      bancoServiceMock.search.and.returnValue(of({ isValid: false, data: {} } as any));

      fixture.detectChanges();

      expect(component.bancos.length).toBe(0);
    });

    it('should notify on search error', () => {
      bancoServiceMock.search.and.returnValue(throwError(() => ({ message: 'boom' })));

      fixture.detectChanges();

      expect(globalNotificationMock.openToastAlert).toHaveBeenCalledWith(
        'Error al buscar',
        'boom',
        'danger'
      );
    });
  });

  describe('onPageChange', () => {
    it('should re-search with the requested page', () => {
      fixture.detectChanges();
      spyOn(component, 'onSearch');

      component.onPageChange(2);

      expect(component.onSearch).toHaveBeenCalledWith(component.filter, 2);
    });
  });

  describe('onClean', () => {
    it('should reset the form and search again', () => {
      fixture.detectChanges();
      component.form.patchValue({ name: 'BCP' });
      spyOn(component, 'onSearch');

      component.onClean();

      expect(component.form.value.name).toBeNull();
      expect(component.onSearch).toHaveBeenCalled();
    });
  });

  describe('openModal', () => {
    it('should delegate to the modal when present', () => {
      fixture.detectChanges();
      component.bancoNewEditModal = jasmine.createSpyObj('BancoNewEditModal', ['openModal']);

      component.openModal(1);

      expect(component.bancoNewEditModal.openModal).toHaveBeenCalledWith(1, jasmine.any(Function));
    });

    it('should not throw when the modal is not yet initialized', () => {
      fixture.detectChanges();

      expect(() => component.openModal()).not.toThrow();
    });
  });

  describe('onDelete', () => {
    it('should delete the banco and refresh on confirmation', (done) => {
      fixture.detectChanges();
      confirmServiceMock.open.and.returnValue(Promise.resolve(true));
      const deleteResponse: ResponseDto<Banco | null> = {
        isValid: true,
        data: null,
        messages: ['Banco eliminado exitosamente'],
      } as any;
      bancoServiceMock.delete.and.returnValue(of(deleteResponse));
      spyOn(component, 'onSearch');

      component.onDelete(1);

      setTimeout(() => {
        expect(bancoServiceMock.delete).toHaveBeenCalledWith(1);
        expect(globalNotificationMock.openAlert).toHaveBeenCalledWith(deleteResponse);
        expect(component.onSearch).toHaveBeenCalled();
        done();
      }, 100);
    });

    it('should not delete when the user cancels', (done) => {
      fixture.detectChanges();
      confirmServiceMock.open.and.returnValue(Promise.resolve(false));

      component.onDelete(1);

      setTimeout(() => {
        expect(bancoServiceMock.delete).not.toHaveBeenCalled();
        done();
      }, 100);
    });

    it('should notify on delete error', (done) => {
      fixture.detectChanges();
      confirmServiceMock.open.and.returnValue(Promise.resolve(true));
      bancoServiceMock.delete.and.returnValue(throwError(() => ({ message: 'no se pudo eliminar' })));

      component.onDelete(1);

      setTimeout(() => {
        expect(globalNotificationMock.openToastAlert).toHaveBeenCalledWith(
          'Error al eliminar',
          'no se pudo eliminar',
          'danger'
        );
        done();
      }, 100);
    });
  });
});

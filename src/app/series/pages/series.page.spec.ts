import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { SeriesPage } from './series.page';
import { SerieService } from '../core/services/serie.service';
import { ConfirmService } from '@shared/confirm-modal/core/services/confirm-modal.service';
import { GlobalNotification } from '@shared/alerts/global-notification/global-notification';
import { Serie } from '../core/models';
import { ResponseDto } from '@shared/models/api/response.dto';
import { ApplicationMessageType } from '@shared/models/api/application-message-type.dto';

describe('SeriesPage', () => {
  let component: SeriesPage;
  let fixture: ComponentFixture<SeriesPage>;
  let serieServiceMock: jasmine.SpyObj<SerieService>;
  let confirmServiceMock: jasmine.SpyObj<ConfirmService>;
  let globalNotificationMock: jasmine.SpyObj<GlobalNotification>;

  const mockSeries: Serie[] = [
    {
      id: 1,
      code: 'FAC',
      number: 'F001',
      counter: 1,
      active: true,
      createdAt: '2026-01-01',
      updatedAt: '2026-01-01',
    },
  ];

  const mockSearchResponse: ResponseDto<{ items: Serie[]; total: number }> = {
    isValid: true,
    data: { items: mockSeries, total: 1 },
    messages: [],
  } as any;

  beforeEach(async () => {
    serieServiceMock = jasmine.createSpyObj('SerieService', [
      'getAll',
      'getById',
      'create',
      'update',
      'delete',
      'search',
    ]);
    serieServiceMock.search.and.returnValue(of(mockSearchResponse));

    confirmServiceMock = jasmine.createSpyObj('ConfirmService', ['open']);
    globalNotificationMock = jasmine.createSpyObj('GlobalNotification', [
      'openAlert',
      'openToastAlert',
    ]);

    await TestBed.configureTestingModule({
      imports: [SeriesPage, ReactiveFormsModule],
      providers: [
        { provide: SerieService, useValue: serieServiceMock },
        { provide: ConfirmService, useValue: confirmServiceMock },
        { provide: GlobalNotification, useValue: globalNotificationMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SeriesPage);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should search on init and populate the series list', () => {
      fixture.detectChanges();

      expect(serieServiceMock.search).toHaveBeenCalled();
      expect(component.series.length).toBe(1);
      expect(component.total).toBe(1);
    });
  });

  describe('onSearch', () => {
    it('should ignore results when the response is invalid', () => {
      serieServiceMock.search.and.returnValue(of({ isValid: false, data: {} } as any));

      fixture.detectChanges();

      expect(component.series.length).toBe(0);
    });

    it('should notify on search error', () => {
      serieServiceMock.search.and.returnValue(throwError(() => ({ messages: 'boom' })));

      fixture.detectChanges();

      expect(globalNotificationMock.openToastAlert).toHaveBeenCalledWith('Error', 'boom', 'danger');
    });
  });

  describe('onPageChange', () => {
    it('should re-run the search for the requested page', () => {
      fixture.detectChanges();
      spyOn(component, 'onSearch');

      component.onPageChange(2);

      expect(component.onSearch).toHaveBeenCalledWith(2);
    });
  });

  describe('openModal', () => {
    it('should delegate to the serie modal when present', () => {
      fixture.detectChanges();
      component.serieModal = jasmine.createSpyObj('SerieModalComponent', ['openModal']);

      component.openModal(1);

      expect(component.serieModal.openModal).toHaveBeenCalledWith(1, jasmine.any(Function));
    });

    it('should not throw when the modal is not yet initialized', () => {
      fixture.detectChanges();

      expect(() => component.openModal()).not.toThrow();
    });
  });

  describe('onDelete', () => {
    it('should delete the serie and refresh on confirmation', (done) => {
      fixture.detectChanges();
      confirmServiceMock.open.and.returnValue(Promise.resolve(true));
      const deleteResponse = {
        isValid: true,
        data: null,
        messages: [
          { key: '', message: 'Serie eliminada exitosamente', messageType: ApplicationMessageType.Ok },
        ],
      };
      serieServiceMock.delete.and.returnValue(of(deleteResponse as any));
      spyOn(component, 'onSearch');

      component.onDelete(1);

      setTimeout(() => {
        expect(serieServiceMock.delete).toHaveBeenCalledWith(1);
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
        expect(serieServiceMock.delete).not.toHaveBeenCalled();
        done();
      }, 100);
    });
  });

  describe('getDocumentTypeName', () => {
    it('should map a known SUNAT document code to its label', () => {
      fixture.detectChanges();

      expect(component.getDocumentTypeName('01')).toBe('Factura');
      expect(component.getDocumentTypeName('03')).toBe('Boleta');
    });

    it('should return the raw code when it is not in the known catalog', () => {
      fixture.detectChanges();

      expect(component.getDocumentTypeName('99')).toBe('99');
    });
  });
});

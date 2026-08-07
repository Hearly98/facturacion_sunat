import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { SerieModalComponent } from './serie-modal.component';
import { SerieService } from '../core/services/serie.service';
import { GlobalNotification } from '@shared/alerts/global-notification/global-notification';
import { DocumentService } from 'src/app/document/core/services/document.service';
import { Serie } from '../core/models';
import { GetDocument } from 'src/app/document/core/models/get-document.model';
import { ResponseDto } from '@shared/models/api/response.dto';

describe('SerieModalComponent', () => {
  let component: SerieModalComponent;
  let fixture: ComponentFixture<SerieModalComponent>;
  let serieServiceMock: jasmine.SpyObj<SerieService>;
  let globalNotificationMock: jasmine.SpyObj<GlobalNotification>;
  let documentServiceMock: jasmine.SpyObj<DocumentService>;

  const mockSerie: Serie = {
    id: 1,
    code: 'FAC',
    number: 'F001',
    counter: 1,
    active: true,
    createdAt: '2026-01-01',
    updatedAt: '2026-01-01',
  };

  const mockDocuments: GetDocument[] = [
    { id: 1, code: 'FAC', name: 'Factura' },
    { id: 2, code: 'BOL', name: 'Boleta' },
  ];

  beforeEach(async () => {
    serieServiceMock = jasmine.createSpyObj('SerieService', ['getById', 'create', 'update']);
    globalNotificationMock = jasmine.createSpyObj('GlobalNotification', [
      'openAlert',
      'openToastAlert',
    ]);
    documentServiceMock = jasmine.createSpyObj('DocumentService', ['getAll']);
    documentServiceMock.getAll.and.returnValue(
      of({ isValid: true, data: mockDocuments } as any)
    );

    await TestBed.configureTestingModule({
      imports: [SerieModalComponent, ReactiveFormsModule],
      providers: [
        { provide: SerieService, useValue: serieServiceMock },
        { provide: GlobalNotification, useValue: globalNotificationMock },
        { provide: DocumentService, useValue: documentServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SerieModalComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should load the document type combo', () => {
      fixture.detectChanges();

      expect(documentServiceMock.getAll).toHaveBeenCalled();
      expect(component.documentos.length).toBe(2);
    });
  });

  describe('openModal - create mode', () => {
    it('should reset the form and default counter to 1', () => {
      fixture.detectChanges();

      component.openModal();

      expect(component.isEdit).toBe(false);
      expect(component.visible).toBe(true);
      expect(component.form.get('counter')?.value).toBe(1);
    });

    it('should store the save callback', () => {
      fixture.detectChanges();
      const callback = jasmine.createSpy('callback');

      component.openModal(undefined, callback);

      expect(component.onSaveCallback).toBe(callback);
    });
  });

  describe('openModal - edit mode', () => {
    it('should mark isEdit and load the serie', () => {
      fixture.detectChanges();
      serieServiceMock.getById.and.returnValue(of({ isValid: true, data: mockSerie } as any));

      component.openModal(1);

      expect(component.isEdit).toBe(true);
      expect(component.serieId).toBe(1);
      expect(serieServiceMock.getById).toHaveBeenCalledWith(1);
    });
  });

  describe('loadSerie', () => {
    it('should patch the form with the translated serie fields', () => {
      fixture.detectChanges();
      serieServiceMock.getById.and.returnValue(of({ isValid: true, data: mockSerie } as any));

      component.loadSerie(1);

      expect(component.form.get('code')?.value).toBe('FAC');
      expect(component.form.get('number')?.value).toBe('F001');
      expect(component.form.get('counter')?.value).toBe(1);
    });
  });

  describe('save', () => {
    it('should not call the service when the form is invalid', () => {
      fixture.detectChanges();
      component.form.reset();

      component.save();

      expect(serieServiceMock.create).not.toHaveBeenCalled();
      expect(serieServiceMock.update).not.toHaveBeenCalled();
    });

    it('should create a serie when not in edit mode', (done) => {
      fixture.detectChanges();
      const response: ResponseDto<Serie> = {
        isValid: true,
        data: mockSerie,
        messages: ['Serie creada exitosamente'],
      } as any;
      serieServiceMock.create.and.returnValue(of(response));
      const callback = jasmine.createSpy('callback');

      component.form.patchValue({ code: 'FAC', number: 'F001', counter: 1 });
      component.onSaveCallback = callback;
      component.save();

      setTimeout(() => {
        expect(serieServiceMock.create).toHaveBeenCalled();
        expect(globalNotificationMock.openAlert).toHaveBeenCalledWith(response);
        expect(callback).toHaveBeenCalled();
        expect(component.visible).toBe(false);
        done();
      }, 50);
    });

    it('should update a serie when in edit mode', (done) => {
      fixture.detectChanges();
      const response: ResponseDto<Serie> = {
        isValid: true,
        data: { ...mockSerie, number: 'F002' },
        messages: ['Serie actualizada exitosamente'],
      } as any;
      serieServiceMock.update.and.returnValue(of(response));
      serieServiceMock.getById.and.returnValue(of({ isValid: true, data: mockSerie } as any));

      component.openModal(1);
      component.form.patchValue({ code: 'FAC', number: 'F002', counter: 1 });
      component.save();

      setTimeout(() => {
        expect(serieServiceMock.update).toHaveBeenCalledWith(1, jasmine.any(Object));
        expect(serieServiceMock.create).not.toHaveBeenCalled();
        done();
      }, 50);
    });

    it('should surface a toast on error', (done) => {
      fixture.detectChanges();
      serieServiceMock.create.and.returnValue(throwError(() => ({ messages: 'Error al guardar' })));

      component.form.patchValue({ code: 'FAC', number: 'F001', counter: 1 });
      component.save();

      setTimeout(() => {
        expect(globalNotificationMock.openToastAlert).toHaveBeenCalledWith(
          'Error',
          'Error al guardar',
          'danger'
        );
        done();
      }, 50);
    });
  });

  describe('closeModal', () => {
    it('should hide the modal and reset the form', () => {
      fixture.detectChanges();
      component.visible = true;
      component.form.patchValue({ code: 'FAC' });

      component.closeModal();

      expect(component.visible).toBe(false);
      expect(component.form.get('code')?.value).toBeNull();
    });
  });

  describe('handleVisibleChange', () => {
    it('should sync the visible flag', () => {
      fixture.detectChanges();

      component.handleVisibleChange(true);
      expect(component.visible).toBe(true);

      component.handleVisibleChange(false);
      expect(component.visible).toBe(false);
    });
  });
});

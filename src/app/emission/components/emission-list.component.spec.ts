import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EmissionListComponent } from './emission-list.component';
import { EmissionService } from '../core/services/emission.service';
import { GlobalNotification } from '@shared/alerts/global-notification/global-notification';
import { GetEmissionModel } from '../core/models/get-emission.model';
import { of } from 'rxjs';

describe('EmissionListComponent', () => {
  let component: EmissionListComponent;
  let fixture: ComponentFixture<EmissionListComponent>;
  let emissionService: jasmine.SpyObj<EmissionService>;
  let notificationService: jasmine.SpyObj<GlobalNotification>;

  beforeEach(async () => {
    const emissionServiceSpy = jasmine.createSpyObj('EmissionService', [
      'downloadPdf',
      'downloadXml',
      'downloadCdr',
    ]);
    const notificationServiceSpy = jasmine.createSpyObj('GlobalNotification', [
      'success',
      'error',
    ]);

    await TestBed.configureTestingModule({
      imports: [EmissionListComponent],
      providers: [
        { provide: EmissionService, useValue: emissionServiceSpy },
        { provide: GlobalNotification, useValue: notificationServiceSpy },
      ],
    }).compileComponents();

    emissionService = TestBed.inject(EmissionService) as jasmine.SpyObj<EmissionService>;
    notificationService = TestBed.inject(GlobalNotification) as jasmine.SpyObj<GlobalNotification>;

    fixture = TestBed.createComponent(EmissionListComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('getStatusBadgeColor', () => {
    it('should return warning for emitida status', () => {
      expect(component.getStatusBadgeColor('emitida')).toBe('warning');
    });

    it('should return success for enviada status', () => {
      expect(component.getStatusBadgeColor('enviada')).toBe('success');
    });

    it('should return danger for error_envio status', () => {
      expect(component.getStatusBadgeColor('error_envio')).toBe('danger');
    });

    it('should return secondary for unknown status', () => {
      expect(component.getStatusBadgeColor('unknown')).toBe('secondary');
    });
  });

  describe('getStatusLabel', () => {
    it('should return Emitida label', () => {
      expect(component.getStatusLabel('emitida')).toBe('Emitida');
    });

    it('should return Enviada label', () => {
      expect(component.getStatusLabel('enviada')).toBe('Enviada');
    });

    it('should return Error al enviar label', () => {
      expect(component.getStatusLabel('error_envio')).toBe('Error al enviar');
    });
  });

  describe('downloadPdf', () => {
    it('should download PDF and show success notification', () => {
      const mockBlob = new Blob(['PDF'], { type: 'application/pdf' });
      const emission: GetEmissionModel = {
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
      };

      emissionService.downloadPdf.and.returnValue(of(mockBlob));
      spyOn(component as any, '_EmissionListComponent__downloadFile');

      component.downloadPdf(emission);

      expect(emissionService.downloadPdf).toHaveBeenCalledWith(emission.id);
      expect(notificationService.success).toHaveBeenCalledWith('PDF descargado correctamente');
    });

    it('should show error notification on download failure', () => {
      const emission: GetEmissionModel = {
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
      };

      emissionService.downloadPdf.and.returnValue(
        new Promise((resolve, reject) => reject(new Error('Download failed')))
      );

      component.downloadPdf(emission);

      setTimeout(() => {
        expect(notificationService.error).toHaveBeenCalledWith('Error al descargar PDF');
      }, 100);
    });
  });

  describe('downloadXml', () => {
    it('should download XML and show success notification', () => {
      const mockBlob = new Blob(['<?xml?>'], { type: 'application/xml' });
      const emission: GetEmissionModel = {
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
      };

      emissionService.downloadXml.and.returnValue(of(mockBlob));
      spyOn(component as any, '_EmissionListComponent__downloadFile');

      component.downloadXml(emission);

      expect(emissionService.downloadXml).toHaveBeenCalledWith(emission.id);
      expect(notificationService.success).toHaveBeenCalledWith('XML descargado correctamente');
    });
  });

  describe('downloadCdr', () => {
    it('should download CDR and show success notification', () => {
      const mockBlob = new Blob(['CDR'], { type: 'application/xml' });
      const emission: GetEmissionModel = {
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
      };

      emissionService.downloadCdr.and.returnValue(of(mockBlob));
      spyOn(component as any, '_EmissionListComponent__downloadFile');

      component.downloadCdr(emission);

      expect(emissionService.downloadCdr).toHaveBeenCalledWith(emission.id);
      expect(notificationService.success).toHaveBeenCalledWith('CDR descargado correctamente');
    });
  });
});

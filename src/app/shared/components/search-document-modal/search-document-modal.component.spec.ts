import { TestBed } from '@angular/core/testing';
import { Component, signal } from '@angular/core';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { of } from 'rxjs';
import { QuotationService } from 'src/app/quotation/core/services/quotation.service';
import { ShippingGuideService } from 'src/app/shipping-guide/core/services/shipping-guide.service';
import { SearchDocumentModalComponent, SearchDocumentType } from './search-document-modal.component';

// Mismo orden de inputs que en ventas: [isVisible] llega ANTES que [documentType].
@Component({
  standalone: true,
  imports: [SearchDocumentModalComponent],
  template: `<app-search-document-modal [isVisible]="visible()" [documentType]="type()" />`,
})
class HostComponent {
  visible = signal(false);
  type = signal<SearchDocumentType>('cotizacion');
}

describe('SearchDocumentModalComponent', () => {
  let quotation: { search: jasmine.Spy };
  let guia: { search: jasmine.Spy; getById: jasmine.Spy };

  beforeEach(async () => {
    quotation = { search: jasmine.createSpy('search').and.returnValue(of({ isValid: true, data: { items: [] } })) };
    guia = {
      search: jasmine.createSpy('search').and.returnValue(of({ isValid: true, data: { items: [] } })),
      getById: jasmine.createSpy('getById').and.returnValue(of({ isValid: true, data: { id: 9 } })),
    };
    await TestBed.configureTestingModule({
      imports: [HostComponent],
      providers: [
        provideNoopAnimations(),
        { provide: QuotationService, useValue: quotation },
        { provide: ShippingGuideService, useValue: guia },
      ],
    }).compileComponents();
  });

  it('abre buscando guías aunque visible y tipo cambien en el mismo ciclo', async () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();

    fixture.componentInstance.type.set('guia');
    fixture.componentInstance.visible.set(true);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(guia.search).toHaveBeenCalled();
    expect(quotation.search).not.toHaveBeenCalled();
    // Para facturar solo se ofrecen guías Generadas.
    expect(guia.search.calls.mostRecent().args[0].filter).toEqual({ estados: ['01'] });
  });

  it('al elegir una guía la pide por su id real', () => {
    const fixture = TestBed.createComponent(SearchDocumentModalComponent);
    fixture.componentInstance.selectGuia({ id: 9 } as any);

    expect(guia.getById).toHaveBeenCalledWith(9);
  });
});

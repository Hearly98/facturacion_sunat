import { TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { of, throwError } from 'rxjs';
import { CreditNoteModalComponent } from './credit-note-modal.component';
import { SunatService } from '../core/services/sunat.service';
import { CreditNoteBalance } from '../core/models/sunat.models';
import { SaleListItemModel } from 'src/app/sales/core/models/sale-list-item.model';

describe('CreditNoteModalComponent', () => {
  let component: CreditNoteModalComponent;
  let sunat: jasmine.SpyObj<SunatService>;

  const sale = { id: 10, numero_completo: 'B001-00000015' } as SaleListItemModel;
  const balance: CreditNoteBalance = {
    canCancel: true,
    lines: [
      { saleDetailId: 1, code: 'P1', name: 'Gaseosa', unitPrice: 9.63, soldQuantity: 3, returnedQuantity: 0, availableQuantity: 3 },
      { saleDetailId: 2, code: 'P2', name: 'Libro', unitPrice: 43.35, soldQuantity: 1, returnedQuantity: 0, availableQuantity: 1 },
    ],
  };
  const creditNote = {
    id: 5, saleId: 10, affectedDocument: 'B001-00000015', number: 'BC01-00000001', issueDate: '2026-10-29',
    reasonCode: '07' as const, reasonDescription: 'DEVOLUCIÓN POR ÍTEM', total: 19.26,
  };

  beforeEach(() => {
    sunat = jasmine.createSpyObj<SunatService>('SunatService', ['getCreditNoteBalance', 'createCreditNote', 'downloadCreditNotePdf']);
    sunat.getCreditNoteBalance.and.returnValue(of(balance));

    TestBed.configureTestingModule({
      imports: [CreditNoteModalComponent],
      providers: [provideNoopAnimations(), { provide: SunatService, useValue: sunat }],
    });
    component = TestBed.createComponent(CreditNoteModalComponent).componentInstance;
  });

  it('al abrir carga el saldo y propone anulación si la boleta no tiene notas', () => {
    component.sale = sale;

    expect(sunat.getCreditNoteBalance).toHaveBeenCalledWith(10);
    expect(component.reason()).toBe('01');
    expect(component.total()).toBe(72.24);
  });

  it('si la boleta ya tiene notas solo permite devolución por ítem', () => {
    sunat.getCreditNoteBalance.and.returnValue(of({ ...balance, canCancel: false }));
    component.sale = sale;

    expect(component.reason()).toBe('07');
    expect(component.canSubmit()).toBeFalse();
  });

  it('en devolución el total suma solo lo indicado y limita al disponible', () => {
    component.sale = sale;
    component.reason.set('07');

    component.setQuantity(1, 2, 3);
    component.setQuantity(2, 5, 1);

    expect(component.quantities()).toEqual({ 1: 2, 2: 1 });
    expect(component.total()).toBe(62.61);
  });

  it('emite la nota sin enviarla: el envío lo gestiona Emisiones', () => {
    sunat.createCreditNote.and.returnValue(of(creditNote));
    component.sale = sale;
    component.reason.set('07');
    component.setQuantity(1, 2, 3);

    component.submit();

    expect(sunat.createCreditNote).toHaveBeenCalledWith({
      saleId: 10,
      reason: '07',
      items: [{ saleDetailId: 1, quantity: 2 }, { saleDetailId: 2, quantity: 0 }],
    });
    expect(component.creditNote()?.number).toBe('BC01-00000001');
    expect(component.saving()).toBeFalse();
  });

  it('muestra el motivo si el backend no permite la nota', () => {
    sunat.createCreditNote.and.returnValue(throwError(() => ({ error: { message: 'La boleta B001-00000015 fue rechazada por SUNAT' } })));
    component.sale = sale;

    component.submit();

    expect(component.creditNote()).toBeNull();
    expect(component.error()).toContain('rechazada');
  });

  it('al cerrar informa si se creó una nota', () => {
    const emitted: boolean[] = [];
    component.closed.subscribe((v) => emitted.push(v));
    sunat.createCreditNote.and.returnValue(of(creditNote));

    component.sale = sale;
    component.close();
    component.sale = sale;
    component.submit();
    component.close();

    expect(emitted).toEqual([false, true]);
    expect(component.sale).toBeNull();
  });
});

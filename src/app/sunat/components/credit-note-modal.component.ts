import { Component, EventEmitter, Input, Output, computed, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  AlertComponent,
  ButtonCloseDirective,
  ButtonDirective,
  ModalBodyComponent,
  ModalComponent,
  ModalFooterComponent,
  ModalHeaderComponent,
  ModalTitleDirective,
  SpinnerComponent,
  TableDirective,
} from '@coreui/angular';
import { IconDirective } from '@coreui/icons-angular';
import { downloadBlobResponse } from '@shared/functions';
import { SaleListItemModel } from 'src/app/sales/core/models/sale-list-item.model';
import { sunatStatusColor, sunatStatusLabel, isValidForSunat } from '../core/helpers/sunat-status';
import { CreditNote, CreditNoteBalance, CreditNoteReason, SunatSendResult } from '../core/models/sunat.models';
import { SunatService, sunatErrorMessage } from '../core/services/sunat.service';

@Component({
  selector: 'app-credit-note-modal',
  standalone: true,
  imports: [
    FormsModule,
    DecimalPipe,
    ModalComponent,
    ModalHeaderComponent,
    ModalTitleDirective,
    ModalBodyComponent,
    ModalFooterComponent,
    ButtonDirective,
    ButtonCloseDirective,
    SpinnerComponent,
    TableDirective,
    AlertComponent,
    IconDirective,
  ],
  styles: `:host { display: contents; }`,
  template: `
    <c-modal alignment="center" size="lg" [visible]="!!sale" (visibleChange)="!$event && close()">
      <c-modal-header>
        <h5 cModalTitle>Nota de crédito · {{ sale?.numero_completo }}</h5>
        <button cButtonClose (click)="close()"></button>
      </c-modal-header>

      <c-modal-body>
        @if (loading()) {
          <div class="text-center py-4"><c-spinner></c-spinner></div>
        } @else if (creditNote()) {
          <!-- Resultado -->
          <p class="mb-2">
            Se emitió la nota de crédito <strong>{{ creditNote()!.number }}</strong>
            por <strong>S/ {{ creditNote()!.total | number: '1.2-2' }}</strong>.
          </p>
          @if (sendResult(); as r) {
            <c-alert [color]="statusColor(r.status)">
              <strong>SUNAT: {{ statusLabel(r.status) }}</strong> — {{ r.description }}
              @for (obs of r.observations; track obs) {
                <div class="small">{{ obs }}</div>
              }
            </c-alert>
          }
          @if (error()) {
            <c-alert color="danger">
              La nota quedó registrada pero no se pudo enviar a SUNAT: {{ error() }}
            </c-alert>
          }
        } @else if (balance(); as b) {
          <!-- Formulario -->
          <label class="form-label fw-semibold">Motivo</label>
          <div class="mb-3">
            <div class="form-check">
              <input class="form-check-input" type="radio" id="nc-01" value="01" [ngModel]="reason()" (ngModelChange)="reason.set($event)" [disabled]="!b.canCancel" />
              <label class="form-check-label" for="nc-01">
                01 · Anulación de la operación <span class="text-muted small">(revierte toda la boleta)</span>
              </label>
              @if (!b.canCancel) {
                <div class="small text-muted">No disponible: la boleta ya tiene notas de crédito.</div>
              }
            </div>
            <div class="form-check">
              <input class="form-check-input" type="radio" id="nc-07" value="07" [ngModel]="reason()" (ngModelChange)="reason.set($event)" />
              <label class="form-check-label" for="nc-07">07 · Devolución por ítem</label>
            </div>
          </div>

          <table cTable small [responsive]="true">
            <thead>
              <tr>
                <th>Producto</th>
                <th class="text-end">P. unit.</th>
                <th class="text-end">Vendido</th>
                <th class="text-end">Devuelto</th>
                <th class="text-end" style="width: 120px;">A acreditar</th>
              </tr>
            </thead>
            <tbody>
              @for (line of b.lines; track line.saleDetailId) {
                <tr>
                  <td>{{ line.name }}</td>
                  <td class="text-end">{{ line.unitPrice | number: '1.2-2' }}</td>
                  <td class="text-end">{{ line.soldQuantity }}</td>
                  <td class="text-end">{{ line.returnedQuantity }}</td>
                  <td class="text-end">
                    @if (reason() === '01') {
                      {{ line.soldQuantity }}
                    } @else {
                      <input
                        type="number"
                        class="form-control form-control-sm text-end"
                        min="0"
                        [max]="line.availableQuantity"
                        [disabled]="line.availableQuantity === 0"
                        [ngModel]="quantities()[line.saleDetailId] ?? 0"
                        (ngModelChange)="setQuantity(line.saleDetailId, $event, line.availableQuantity)"
                      />
                    }
                  </td>
                </tr>
              }
            </tbody>
          </table>

          <div class="text-end fs-5">
            Total a acreditar: <strong>S/ {{ total() | number: '1.2-2' }}</strong>
          </div>
          <div class="small text-muted text-end">
            Los productos vuelven al almacén si la venta movió stock.
          </div>

          @if (error()) {
            <c-alert color="danger" class="mt-3">{{ error() }}</c-alert>
          }
        }
      </c-modal-body>

      <c-modal-footer>
        @if (creditNote()) {
          @if (!sendResult() || !isValid(sendResult()!.status)) {
            <button cButton color="warning" [disabled]="saving()" (click)="send()">
              @if (saving()) { <c-spinner size="sm" class="me-1"></c-spinner> }
              Reintentar envío a SUNAT
            </button>
          }
          <button cButton color="primary" variant="outline" (click)="download('pdf')">
            <svg cIcon name="cilPrint" class="me-1"></svg> PDF
          </button>
          <button cButton color="secondary" (click)="close()">Cerrar</button>
        } @else {
          <button cButton color="secondary" (click)="close()">Cancelar</button>
          <button cButton color="danger" [disabled]="!canSubmit() || saving()" (click)="submit()">
            @if (saving()) { <c-spinner size="sm" class="me-1"></c-spinner> }
            Emitir nota de crédito
          </button>
        }
      </c-modal-footer>
    </c-modal>
  `,
})
export class CreditNoteModalComponent {
  readonly #sunat = inject(SunatService);

  #sale: SaleListItemModel | null = null;

  @Input() set sale(value: SaleListItemModel | null) {
    this.#sale = value;
    this.reset();
    if (value) {
      this.load(value.id);
    }
  }
  get sale(): SaleListItemModel | null {
    return this.#sale;
  }

  /** Se emite al cerrar; `true` si se creó una nota (para refrescar el listado). */
  @Output() closed = new EventEmitter<boolean>();

  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly balance = signal<CreditNoteBalance | null>(null);
  readonly reason = signal<CreditNoteReason>('07');
  readonly quantities = signal<Partial<Record<number, number>>>({});
  readonly creditNote = signal<CreditNote | null>(null);
  readonly sendResult = signal<SunatSendResult | null>(null);
  readonly error = signal<string | null>(null);

  readonly statusLabel = sunatStatusLabel;
  readonly statusColor = sunatStatusColor;
  readonly isValid = isValidForSunat;

  readonly total = computed(() => {
    const balance = this.balance();
    if (!balance) return 0;
    const sum = balance.lines.reduce((acc, line) => {
      const qty = this.reason() === '01' ? line.soldQuantity : this.quantities()[line.saleDetailId] ?? 0;
      return acc + Math.round(qty * line.unitPrice * 100) / 100;
    }, 0);
    return Math.round(sum * 100) / 100;
  });

  readonly canSubmit = computed(() => this.total() > 0 && (this.reason() === '07' || !!this.balance()?.canCancel));

  setQuantity(saleDetailId: number, value: number | string, max: number): void {
    const qty = Math.min(Math.max(Math.trunc(Number(value) || 0), 0), max);
    this.quantities.update((current) => ({ ...current, [saleDetailId]: qty }));
  }

  submit(): void {
    const sale = this.#sale;
    const balance = this.balance();
    if (!sale || !balance || !this.canSubmit()) return;

    this.saving.set(true);
    this.error.set(null);
    this.#sunat
      .createCreditNote({
        saleId: sale.id,
        reason: this.reason(),
        items:
          this.reason() === '01'
            ? []
            : balance.lines.map((line) => ({ saleDetailId: line.saleDetailId, quantity: this.quantities()[line.saleDetailId] ?? 0 })),
      })
      .subscribe({
        next: (creditNote) => {
          this.creditNote.set(creditNote);
          this.send();
        },
        error: (err) => {
          this.saving.set(false);
          this.error.set(sunatErrorMessage(err));
        },
      });
  }

  send(): void {
    const creditNote = this.creditNote();
    if (!creditNote) return;

    this.saving.set(true);
    this.error.set(null);
    this.#sunat.sendCreditNote(creditNote.id).subscribe({
      next: (result) => {
        this.saving.set(false);
        this.sendResult.set(result);
      },
      error: (err) => {
        this.saving.set(false);
        this.error.set(sunatErrorMessage(err));
      },
    });
  }

  download(file: 'pdf' | 'xml' | 'cdr'): void {
    const creditNote = this.creditNote();
    if (!creditNote) return;
    this.#sunat.downloadCreditNoteFile(creditNote.id, file).subscribe({
      next: (response) => downloadBlobResponse(response, `${creditNote.number}.${file === 'cdr' ? 'zip' : file}`),
      error: (err) => this.error.set(sunatErrorMessage(err)),
    });
  }

  close(): void {
    const created = !!this.creditNote();
    this.#sale = null;
    this.reset();
    this.closed.emit(created);
  }

  private load(saleId: number): void {
    this.loading.set(true);
    this.#sunat.getCreditNoteBalance(saleId).subscribe({
      next: (balance) => {
        this.balance.set(balance);
        this.reason.set(balance.canCancel ? '01' : '07');
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(sunatErrorMessage(err));
      },
    });
  }

  private reset(): void {
    this.balance.set(null);
    this.quantities.set({});
    this.creditNote.set(null);
    this.sendResult.set(null);
    this.error.set(null);
    this.saving.set(false);
  }
}

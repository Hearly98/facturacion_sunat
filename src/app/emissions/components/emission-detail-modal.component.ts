import { Component, EventEmitter, Input, Output, inject, signal } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import {
  AlertComponent,
  BadgeComponent,
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
import { downloadBlobResponse } from '@shared/functions';
import {
  canReschedule,
  canSendNow,
  DEADLINE_COLORS,
  deadlineLevel,
  deadlineText,
  emissionStatusColor,
  emissionStatusLabel,
} from '../core/helpers/emission-status';
import { EmissionDetail } from '../core/models/emission.models';
import { EmissionFile, EmissionService, emissionErrorMessage } from '../core/services/emission.service';

@Component({
  selector: 'app-emission-detail-modal',
  standalone: true,
  imports: [
    DatePipe,
    DecimalPipe,
    ModalComponent,
    ModalHeaderComponent,
    ModalTitleDirective,
    ModalBodyComponent,
    ModalFooterComponent,
    ButtonDirective,
    ButtonCloseDirective,
    BadgeComponent,
    AlertComponent,
    SpinnerComponent,
    TableDirective,
  ],
  styles: `:host { display: contents; }`,
  template: `
    <c-modal alignment="center" size="lg" [visible]="emissionId !== null" (visibleChange)="!$event && close()">
      <c-modal-header>
        <h5 cModalTitle>{{ detail()?.documentTypeName }} {{ detail()?.number }}</h5>
        <button cButtonClose (click)="close()"></button>
      </c-modal-header>
      <c-modal-body>
        @if (loading()) {
          <div class="text-center py-4"><c-spinner></c-spinner></div>
        } @else if (detail(); as d) {
          <div class="d-flex flex-wrap gap-2 mb-3 align-items-center">
            <c-badge [color]="statusColor(d.status)">{{ statusLabel(d.status) }}</c-badge>
            <c-badge [color]="deadlineColor(d)" [class.text-dark]="deadlineColor(d) === 'light'">Plazo: {{ deadline(d) }}</c-badge>
            @if (d.affectedDocument) {
              <span class="small text-body-secondary">Modifica {{ d.affectedDocument }}</span>
            }
          </div>
          <table cTable small class="mb-3">
            <tbody>
              <tr><th class="w-25">Cliente</th><td>{{ d.customer }}</td></tr>
              <tr><th>Total</th><td>S/ {{ d.total | number: '1.2-2' }}</td></tr>
              <tr><th>Emitido</th><td>{{ d.issuedAt | date: 'dd/MM/yyyy HH:mm' }}</td></tr>
              <tr><th>Programado para</th><td>{{ d.scheduledFor | date: 'dd/MM/yyyy HH:mm' }}</td></tr>
              <tr><th>Fecha límite</th><td>{{ d.deadline | date: 'dd/MM/yyyy HH:mm' }}</td></tr>
              @if (d.nextAttemptAt) {
                <tr><th>Próximo reintento</th><td>{{ d.nextAttemptAt | date: 'dd/MM/yyyy HH:mm' }}</td></tr>
              }
              @if (d.hash) {
                <tr><th>Hash</th><td class="font-monospace small">{{ d.hash }}</td></tr>
              }
            </tbody>
          </table>

          @if (d.responseDescription) {
            <c-alert [color]="statusColor(d.status)" class="py-2">
              <strong>{{ d.responseCode === 'LOCAL' ? 'Datos por corregir' : 'Respuesta SUNAT' }}:</strong> {{ d.responseDescription }}
              @for (obs of d.observations; track obs) {
                <div class="small">{{ obs }}</div>
              }
            </c-alert>
          }

          @if (d.history.length) {
            <h6 class="mt-3">Historial de intentos</h6>
            <table cTable small striped>
              <thead><tr><th>#</th><th>Fecha</th><th>Resultado</th><th>Detalle</th></tr></thead>
              <tbody>
                @for (h of d.history; track h.number) {
                  <tr>
                    <td>{{ h.number }}</td>
                    <td class="text-nowrap">{{ h.date | date: 'dd/MM HH:mm' }}</td>
                    <td><c-badge [color]="statusColor(h.status)">{{ statusLabel(h.status) }}</c-badge></td>
                    <td class="small">{{ h.code }} {{ h.description }}</td>
                  </tr>
                }
              </tbody>
            </table>
          }

          @if (error()) {
            <c-alert color="danger" class="mt-2 mb-0">{{ error() }}</c-alert>
          }
        }
      </c-modal-body>
      <c-modal-footer>
        @if (detail(); as d) {
          @if (canReschedule(d.status)) {
            <button cButton color="secondary" variant="outline" [disabled]="busy()" (click)="reschedule(d)" title="Tras corregir los datos, vuelve a la bandeja">Reprogramar</button>
          }
          @if (canSendNow(d.status)) {
            <button cButton color="success" [disabled]="busy()" (click)="send(d)">
              @if (busy()) { <c-spinner size="sm" class="me-1"></c-spinner> }
              Enviar ahora
            </button>
          }
          <button cButton color="primary" variant="outline" (click)="download(d, 'pdf')">PDF</button>
          @if (d.hasXml) {
            <button cButton color="info" variant="outline" (click)="download(d, 'xml')">XML</button>
          }
          @if (d.hasCdr) {
            <button cButton color="info" variant="outline" (click)="download(d, 'cdr')">CDR</button>
          }
        }
        <button cButton color="secondary" (click)="close()">Cerrar</button>
      </c-modal-footer>
    </c-modal>
  `,
})
export class EmissionDetailModalComponent {
  readonly #service = inject(EmissionService);

  #emissionId: number | null = null;

  @Input() set emissionId(id: number | null) {
    this.#emissionId = id;
    this.detail.set(null);
    this.error.set(null);
    if (id !== null) this.load(id);
  }
  get emissionId(): number | null {
    return this.#emissionId;
  }

  /** `true` si cambió algo (para refrescar el listado). */
  @Output() closed = new EventEmitter<boolean>();

  readonly detail = signal<EmissionDetail | null>(null);
  readonly loading = signal(false);
  readonly busy = signal(false);
  readonly error = signal<string | null>(null);
  #changed = false;

  readonly statusLabel = emissionStatusLabel;
  readonly statusColor = emissionStatusColor;
  readonly canSendNow = canSendNow;
  readonly canReschedule = canReschedule;
  deadline = (d: EmissionDetail) => deadlineText(d.status, d.hoursLeft);
  deadlineColor = (d: EmissionDetail) => DEADLINE_COLORS[deadlineLevel(d.status, d.hoursLeft)];

  send(d: EmissionDetail): void {
    this.run(this.#service.sendNow(d.id));
  }

  reschedule(d: EmissionDetail): void {
    this.run(this.#service.reschedule(d.id));
  }

  download(d: EmissionDetail, file: EmissionFile): void {
    this.#service.download(d.id, file).subscribe({
      next: (response) => downloadBlobResponse(response, `${d.number}.${file === 'cdr' ? 'zip' : file}`),
      error: (err) => this.error.set(emissionErrorMessage(err)),
    });
  }

  close(): void {
    const changed = this.#changed;
    this.#changed = false;
    this.#emissionId = null;
    this.detail.set(null);
    this.closed.emit(changed);
  }

  private run(request: ReturnType<EmissionService['sendNow']>): void {
    this.busy.set(true);
    this.error.set(null);
    request.subscribe({
      next: (detail) => {
        this.busy.set(false);
        this.#changed = true;
        this.detail.set(detail);
      },
      error: (err) => {
        this.busy.set(false);
        this.#changed = true;
        this.error.set(emissionErrorMessage(err));
        if (this.#emissionId !== null) this.load(this.#emissionId);
      },
    });
  }

  private load(id: number): void {
    this.loading.set(true);
    this.#service.detail(id).subscribe({
      next: (detail) => {
        this.detail.set(detail);
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(emissionErrorMessage(err));
      },
    });
  }
}

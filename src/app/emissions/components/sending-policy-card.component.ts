import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AlertComponent, ButtonDirective, CardBodyComponent, CardComponent, CardHeaderComponent, SpinnerComponent } from '@coreui/angular';
import { GlobalNotification } from '@shared/alerts/global-notification/global-notification';
import { SunatConfig } from 'src/app/sunat/core/models/sunat.models';
import { SunatService, sunatErrorMessage } from 'src/app/sunat/core/services/sunat.service';
import { SendingPolicy, SendingPolicyType } from '../core/models/emission.models';

const WEEK_DAYS = [
  { value: 1, label: 'Lun' },
  { value: 2, label: 'Mar' },
  { value: 3, label: 'Mié' },
  { value: 4, label: 'Jue' },
  { value: 5, label: 'Vie' },
  { value: 6, label: 'Sáb' },
  { value: 7, label: 'Dom' },
];

/**
 * Cuándo se envían los comprobantes a SUNAT. El backend topa cualquier política con el plazo legal
 * y devuelve las advertencias que se muestran aquí.
 */
@Component({
  selector: 'app-sending-policy-card',
  standalone: true,
  imports: [FormsModule, CardComponent, CardHeaderComponent, CardBodyComponent, ButtonDirective, AlertComponent, SpinnerComponent],
  template: `
    <c-card>
      <c-card-header><strong>Política de envío</strong></c-card-header>
      <c-card-body>
        @if (loading()) {
          <c-spinner size="sm"></c-spinner>
        } @else {
          <div class="mb-3">
            @for (option of options; track option.value) {
              <div class="form-check">
                <input class="form-check-input" type="radio" name="policy" [id]="'pol-' + option.value" [value]="option.value" [(ngModel)]="policy.type" />
                <label class="form-check-label" [for]="'pol-' + option.value">
                  <strong>{{ option.label }}</strong> <span class="small text-body-secondary">— {{ option.help }}</span>
                </label>
              </div>
            }
          </div>

          @if (policy.type === 'FIN_DEL_DIA' || policy.type === 'PROGRAMADO') {
            <div class="mb-3" style="max-width: 180px;">
              <label class="form-label" for="pol-time">Hora de envío</label>
              <input id="pol-time" type="time" class="form-control" [(ngModel)]="policy.time" />
            </div>
          }

          @if (policy.type === 'PROGRAMADO') {
            <div class="mb-3">
              <span class="form-label d-block">Días de envío</span>
              @for (day of weekDays; track day.value) {
                <div class="form-check form-check-inline">
                  <input class="form-check-input" type="checkbox" [id]="'day-' + day.value" [checked]="policy.days.includes(day.value)" (change)="toggleDay(day.value)" />
                  <label class="form-check-label" [for]="'day-' + day.value">{{ day.label }}</label>
                </div>
              }
            </div>
          }

          <div class="mb-3" style="max-width: 220px;">
            <label class="form-label" for="pol-margin">Margen de seguridad (horas)</label>
            <input id="pol-margin" type="number" min="0" max="72" class="form-control" [(ngModel)]="policy.safetyMarginHours" />
            <div class="form-text">Antes del vencimiento legal, el comprobante sale aunque la política diga otra cosa.</div>
          </div>

          @for (warning of warnings(); track warning) {
            <c-alert color="warning" class="py-2">{{ warning }}</c-alert>
          }
          @if (error()) {
            <c-alert color="danger" class="py-2">{{ error() }}</c-alert>
          }

          <button cButton color="primary" [disabled]="saving() || !isValid()" (click)="save()">
            @if (saving()) { <c-spinner size="sm" class="me-1"></c-spinner> }
            Guardar política
          </button>
        }
      </c-card-body>
    </c-card>
  `,
})
export class SendingPolicyCardComponent implements OnInit {
  readonly #sunat = inject(SunatService);
  readonly #notification = inject(GlobalNotification);

  readonly options: { value: SendingPolicyType; label: string; help: string }[] = [
    { value: 'INMEDIATO', label: 'Inmediato', help: 'se envía apenas se registra la venta' },
    { value: 'FIN_DEL_DIA', label: 'Al cierre del día', help: 'todo lo del día sale a la hora indicada' },
    { value: 'PROGRAMADO', label: 'Programado', help: 'los días y la hora que elija' },
    { value: 'MANUAL', label: 'Manual', help: 'desde esta bandeja; igual sale solo antes del vencimiento' },
  ];
  readonly weekDays = WEEK_DAYS;

  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly warnings = signal<string[]>([]);
  readonly error = signal<string | null>(null);

  policy: SendingPolicy = { type: 'INMEDIATO', time: '23:00', days: [], safetyMarginHours: 24, warnings: [] };
  #config: SunatConfig | null = null;

  ngOnInit(): void {
    this.#sunat.getConfig().subscribe({
      next: (config) => this.apply(config),
      error: () => this.loading.set(false),
    });
  }

  toggleDay(day: number): void {
    this.policy.days = this.policy.days.includes(day) ? this.policy.days.filter((d) => d !== day) : [...this.policy.days, day].sort();
  }

  isValid(): boolean {
    return this.policy.type !== 'PROGRAMADO' || this.policy.days.length > 0;
  }

  save(): void {
    this.saving.set(true);
    this.error.set(null);
    this.#sunat.savePolicy(this.policy, this.#config?.environment ?? 'prueba', !!this.#config).subscribe({
      next: (config) => {
        this.saving.set(false);
        this.apply(config);
        this.#notification.openToastAlert('Emisiones', 'Política de envío guardada', 'success');
      },
      error: (err) => {
        this.saving.set(false);
        this.error.set(err?.error?.errors ? Object.values(err.error.errors).flat().join(' ') : sunatErrorMessage(err));
      },
    });
  }

  private apply(config: SunatConfig): void {
    this.#config = config;
    this.policy = { ...config.policy, days: [...config.policy.days] };
    this.warnings.set(config.policy.warnings);
    this.loading.set(false);
  }
}

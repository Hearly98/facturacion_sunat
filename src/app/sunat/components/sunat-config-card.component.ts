import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  AlertComponent,
  BadgeComponent,
  ButtonDirective,
  CardBodyComponent,
  CardComponent,
  CardHeaderComponent,
  ColComponent,
  RowComponent,
  SpinnerComponent,
} from '@coreui/angular';
import { GlobalNotification } from '@shared/alerts/global-notification/global-notification';
import { SunatConfig, SunatEnvironment } from '../core/models/sunat.models';
import { SunatService, sunatErrorMessage } from '../core/services/sunat.service';

/**
 * Ambiente y credenciales de emisión. La clave SOL y el certificado nunca vuelven del backend:
 * solo se muestra si están registrados.
 */
@Component({
  selector: 'app-sunat-config-card',
  standalone: true,
  imports: [
    FormsModule,
    CardComponent,
    CardHeaderComponent,
    CardBodyComponent,
    RowComponent,
    ColComponent,
    ButtonDirective,
    BadgeComponent,
    AlertComponent,
    SpinnerComponent,
  ],
  template: `
    <c-card class="mt-4">
      <c-card-header>
        <strong>Facturación electrónica (SUNAT)</strong>
      </c-card-header>
      <c-card-body>
        @if (loading()) {
          <c-spinner size="sm"></c-spinner>
        } @else {
          <c-row class="g-3">
            <c-col [md]="4">
              <label class="form-label" for="sunat-env">Ambiente</label>
              <select id="sunat-env" class="form-select" [ngModel]="environment()" (ngModelChange)="environment.set($event)">
                <option value="prueba">Prueba (beta)</option>
                <option value="produccion">Producción</option>
              </select>
              @if (environment() === 'produccion') {
                <div class="small text-danger mt-1">Los comprobantes se envían a SUNAT con validez legal.</div>
              }
              <button cButton color="primary" size="sm" class="mt-2" [disabled]="saving()" (click)="saveEnvironment()">
                Guardar ambiente
              </button>
            </c-col>

            <c-col [md]="8">
              @if (config()?.credentialsStatus === 'ILEGIBLES') {
                <c-alert color="danger" class="py-2 small" data-testid="credenciales-ilegibles">
                  {{ config()?.credentialsMessage || 'Las credenciales guardadas no pueden leerse. Vuelva a registrarlas.' }}
                </c-alert>
              }
              <div class="mb-2">
                <c-badge [color]="config()?.hasCertificate ? 'success' : 'secondary'" class="me-2">
                  Certificado: {{ config()?.hasCertificate ? 'registrado' : 'pendiente' }}
                </c-badge>
                @if (config()?.certificateExpiresAt) {
                  <span class="small text-muted">vence el {{ config()?.certificateExpiresAt }}</span>
                }
              </div>
              <c-row class="g-2">
                <c-col [md]="6">
                  <label class="form-label" for="sol-user">Usuario SOL secundario</label>
                  <input id="sol-user" class="form-control" autocomplete="off" [(ngModel)]="solUser" />
                </c-col>
                <c-col [md]="6">
                  <label class="form-label" for="sol-pass">Clave SOL</label>
                  <input id="sol-pass" class="form-control" type="password" autocomplete="new-password" [(ngModel)]="solPassword"
                         [placeholder]="config()?.hasSolPassword ? '•••••• (registrada)' : ''" />
                </c-col>
                <c-col [md]="6">
                  <label class="form-label" for="cert-file">Certificado digital (.pfx / .p12)</label>
                  <input id="cert-file" class="form-control" type="file" accept=".pfx,.p12" (change)="onCertificate($event)" />
                </c-col>
                <c-col [md]="6">
                  <label class="form-label" for="cert-pass">Contraseña del certificado</label>
                  <input id="cert-pass" class="form-control" type="password" autocomplete="new-password" [(ngModel)]="certificatePassword" [disabled]="!certificate" />
                </c-col>
              </c-row>
              @if (environment() === 'prueba') {
                <div class="small text-muted mt-2">En ambiente de prueba SUNAT usa el usuario MODDATOS y la clave moddatos.</div>
              }
              @if (error()) {
                <c-alert color="danger" class="mt-2 mb-0">{{ error() }}</c-alert>
              }
              <button cButton color="success" size="sm" class="mt-2" [disabled]="saving() || !solUser || !solPassword" (click)="saveCredentials()">
                @if (saving()) { <c-spinner size="sm" class="me-1"></c-spinner> }
                Guardar credenciales
              </button>
            </c-col>
          </c-row>
        }
      </c-card-body>
    </c-card>
  `,
})
export class SunatConfigCardComponent implements OnInit {
  readonly #sunat = inject(SunatService);
  readonly #notification = inject(GlobalNotification);

  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly config = signal<SunatConfig | null>(null);
  readonly environment = signal<SunatEnvironment>('prueba');
  readonly error = signal<string | null>(null);

  solUser = '';
  solPassword = '';
  certificate: File | null = null;
  certificatePassword = '';

  ngOnInit(): void {
    this.#sunat.getConfig().subscribe({
      next: (config) => this.applyConfig(config),
      // 404: la empresa aún no configuró SUNAT
      error: () => this.loading.set(false),
    });
  }

  onCertificate(event: Event): void {
    this.certificate = (event.target as HTMLInputElement).files?.[0] ?? null;
  }

  saveEnvironment(): void {
    this.saving.set(true);
    this.#sunat.saveEnvironment(this.environment(), !!this.config()).subscribe({
      next: () => {
        this.saving.set(false);
        this.#notification.openToastAlert('SUNAT', 'Ambiente actualizado', 'success');
        this.ngOnInit();
      },
      error: (err) => {
        this.saving.set(false);
        this.error.set(sunatErrorMessage(err));
      },
    });
  }

  saveCredentials(): void {
    this.saving.set(true);
    this.error.set(null);
    this.#sunat.saveCredentials(this.solUser, this.solPassword, this.certificate, this.certificatePassword).subscribe({
      next: (config) => {
        this.saving.set(false);
        this.solPassword = '';
        this.certificate = null;
        this.certificatePassword = '';
        this.applyConfig(config);
        this.#notification.openToastAlert('SUNAT', 'Credenciales guardadas', 'success');
      },
      error: (err) => {
        this.saving.set(false);
        this.error.set(err?.error?.errors?.certificado?.[0] ?? sunatErrorMessage(err));
      },
    });
  }

  private applyConfig(config: SunatConfig): void {
    this.config.set(config);
    this.environment.set(config.environment);
    this.solUser = config.solUser ?? '';
    this.loading.set(false);
  }
}

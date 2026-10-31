import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  BadgeComponent,
  ButtonDirective,
  CardBodyComponent,
  CardComponent,
  ColComponent,
  RowComponent,
  SpinnerComponent,
  TableDirective,
} from '@coreui/angular';
import { IconDirective } from '@coreui/icons-angular';
import { NgxPermissionsService } from 'ngx-permissions';
import { GlobalNotification } from '@shared/alerts/global-notification/global-notification';
import { PaginatorComponent } from '@shared/components/paginator/paginator.component';
import { downloadBlobResponse } from '@shared/functions';
import { EmissionDetailModalComponent } from '../components/emission-detail-modal.component';
import {
  canSendNow,
  DEADLINE_COLORS,
  deadlineLevel,
  deadlineText,
  emissionStatusColor,
  emissionStatusLabel,
  isEmissionValid,
} from '../core/helpers/emission-status';
import { Emission, EmissionFamily, EmissionStatus, EmissionSummary } from '../core/models/emission.models';
import { EmissionService, emissionErrorMessage } from '../core/services/emission.service';

const TITLES: Record<EmissionFamily, { title: string; subtitle: string }> = {
  boletas: { title: 'Boletas electrónicas', subtitle: 'Boletas y sus notas de crédito · plazo legal de envío: 7 días' },
  facturas: { title: 'Facturas electrónicas', subtitle: 'Facturas y sus notas de crédito · plazo legal de envío: 3 días' },
};

const PAGE_SIZE = 20;

/**
 * Bandeja de emisión de una familia (boletas | facturas). La familia viene de la ruta, así ambas
 * vistas comparten el mismo componente.
 */
@Component({
  selector: 'app-emissions-page',
  standalone: true,
  imports: [
    FormsModule,
    DatePipe,
    DecimalPipe,
    RowComponent,
    ColComponent,
    CardComponent,
    CardBodyComponent,
    ButtonDirective,
    BadgeComponent,
    TableDirective,
    SpinnerComponent,
    IconDirective,
    PaginatorComponent,
    EmissionDetailModalComponent,
  ],
  templateUrl: './emissions.page.html',
})
export class EmissionsPage implements OnInit {
  readonly #service = inject(EmissionService);
  /** Enviar y reprogramar exigen emisiones.enviar; sin él la bandeja queda en solo lectura (el backend también lo valida). */
  readonly canSend = inject(NgxPermissionsService).getPermission('emisiones.enviar') !== undefined;
  readonly #route = inject(ActivatedRoute);
  readonly #router = inject(Router);
  readonly #notification = inject(GlobalNotification);

  readonly family = signal<EmissionFamily>('boletas');
  readonly texts = computed(() => TITLES[this.family()]);

  readonly emissions = signal<Emission[]>([]);
  readonly summary = signal<EmissionSummary | null>(null);
  readonly loading = signal(false);
  readonly total = signal(0);
  readonly selected = signal<Set<number>>(new Set());
  readonly sendingId = signal<number | null>(null);
  readonly detailId = signal<number | null>(null);

  page = 1;
  readonly pageSize = PAGE_SIZE;
  status: EmissionStatus | '' = '';
  from: string | null = null;
  to: string | null = null;
  search = '';
  dueSoon = false;

  readonly statusOptions: { value: EmissionStatus | ''; label: string }[] = [
    { value: '', label: 'Todos los estados' },
    ...(['PROGRAMADA', 'ESPERANDO_DEPENDENCIA', 'EN_COLA', 'ERROR', 'RECHAZADA', 'ACEPTADA', 'OBSERVADA'] as EmissionStatus[]).map((s) => ({
      value: s,
      label: emissionStatusLabel(s),
    })),
  ];

  readonly statusLabel = emissionStatusLabel;
  readonly statusColor = emissionStatusColor;
  readonly canSendNow = (status: EmissionStatus) => this.canSend && canSendNow(status);
  readonly isValid = isEmissionValid;
  deadline = (e: Emission) => deadlineText(e.status, e.hoursLeft);
  deadlineColor = (e: Emission) => DEADLINE_COLORS[deadlineLevel(e.status, e.hoursLeft)];

  readonly selectableIds = computed(() => this.emissions().filter((e) => this.canSendNow(e.status)).map((e) => e.id));
  readonly allSelected = computed(() => {
    const ids = this.selectableIds();
    return ids.length > 0 && ids.every((id) => this.selected().has(id));
  });

  ngOnInit(): void {
    this.#route.data.subscribe((data) => {
      this.family.set((data['family'] as EmissionFamily) ?? 'boletas');
      this.clear();
    });
    this.#route.queryParamMap.subscribe((params) => {
      const id = Number(params.get('emision'));
      if (id) this.detailId.set(id);
    });
  }

  load(): void {
    this.loading.set(true);
    this.#service
      .list({ family: this.family(), status: this.status, from: this.from, to: this.to, search: this.search, dueSoon: this.dueSoon, page: this.page, perPage: PAGE_SIZE })
      .subscribe({
        next: (result) => {
          this.emissions.set(result.items);
          this.total.set(result.total);
          this.selected.set(new Set());
          this.loading.set(false);
        },
        error: (err) => {
          this.loading.set(false);
          this.#notification.openToastAlert('Emisiones', emissionErrorMessage(err), 'danger');
        },
      });
    this.#service.summary(this.family()).subscribe({ next: (s) => this.summary.set(s) });
  }

  applyFilters(): void {
    this.page = 1;
    this.load();
  }

  clear(): void {
    this.status = '';
    this.from = null;
    this.to = null;
    this.search = '';
    this.dueSoon = false;
    this.applyFilters();
  }

  filterBy(status: EmissionStatus | '', dueSoon = false): void {
    this.status = status;
    this.dueSoon = dueSoon;
    this.applyFilters();
  }

  onPageChange(page: number): void {
    this.page = page;
    this.load();
  }

  toggle(id: number): void {
    this.selected.update((current) => {
      const next = new Set(current);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  toggleAll(): void {
    this.selected.set(this.allSelected() ? new Set() : new Set(this.selectableIds()));
  }

  sendNow(emission: Emission): void {
    this.sendingId.set(emission.id);
    this.#service.sendNow(emission.id).subscribe({
      next: (detail) => {
        this.sendingId.set(null);
        const ok = isEmissionValid(detail.status);
        this.#notification.openToastAlert(`${detail.number}: ${emissionStatusLabel(detail.status)}`, detail.responseDescription ?? '', ok ? 'success' : 'danger');
        this.load();
      },
      error: (err) => {
        this.sendingId.set(null);
        this.#notification.openToastAlert(emission.number, emissionErrorMessage(err), 'danger');
        this.load();
      },
    });
  }

  sendSelected(): void {
    const ids = [...this.selected()];
    if (!ids.length) return;
    this.#service.sendBatch(ids).subscribe({
      next: ({ queued, skipped }) => {
        const extra = skipped ? ` (${skipped} omitidas)` : '';
        this.#notification.openToastAlert('Emisiones', `${queued} comprobantes enviados a la cola${extra}`, 'info');
        this.load();
      },
      error: (err) => this.#notification.openToastAlert('Emisiones', emissionErrorMessage(err), 'danger'),
    });
  }

  download(emission: Emission, file: 'pdf' | 'xml' | 'cdr'): void {
    this.#service.download(emission.id, file).subscribe({
      next: (response) => downloadBlobResponse(response, `${emission.number}.${file === 'cdr' ? 'zip' : file}`),
      error: (err) => this.#notification.openToastAlert('Emisiones', emissionErrorMessage(err), 'danger'),
    });
  }

  openDetail(emission: Emission): void {
    this.detailId.set(emission.id);
  }

  onDetailClosed(changed: boolean): void {
    this.detailId.set(null);
    if (this.#route.snapshot.queryParamMap.has('emision')) {
      this.#router.navigate([], { queryParams: { emision: null }, queryParamsHandling: 'merge', replaceUrl: true });
    }
    if (changed) this.load();
  }
}

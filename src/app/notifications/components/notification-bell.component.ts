import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import {
  BadgeComponent,
  DropdownComponent,
  DropdownHeaderDirective,
  DropdownMenuDirective,
  DropdownToggleDirective,
} from '@coreui/angular';
import { IconDirective } from '@coreui/icons-angular';
import { AppNotification, NotificationService } from '../core/notification.service';

const POLL_MS = 60_000;

/**
 * Campana del header: no interrumpe el flujo (sin modales ni toasts). Consulta solo el contador,
 * se pausa con la pestaña oculta y carga la lista al abrir el desplegable.
 */
@Component({
  selector: 'app-notification-bell',
  standalone: true,
  imports: [DatePipe, DropdownComponent, DropdownToggleDirective, DropdownMenuDirective, DropdownHeaderDirective, BadgeComponent, IconDirective],
  styles: `
    .bell-menu { width: 360px; max-height: 420px; overflow-y: auto; }
    .bell-item { cursor: pointer; border-left: 3px solid transparent; }
    .bell-item:hover { background: var(--cui-tertiary-bg); }
    .bell-item.unread { background: var(--cui-primary-bg-subtle); }
    .bell-item.critico { border-left-color: var(--cui-danger); }
    .bell-item.advertencia { border-left-color: var(--cui-warning); }
  `,
  template: `
    <c-dropdown alignment="end" variant="nav-item" (visibleChange)="$event && loadList()">
      <button cDropdownToggle [caret]="false" class="btn position-relative py-1" aria-label="Notificaciones">
        <svg cIcon name="cilBell" size="lg"></svg>
        @if (unread() > 0) {
          <c-badge color="danger" shape="rounded-pill" position="top-end" class="position-absolute">
            {{ unread() > 99 ? '99+' : unread() }}
          </c-badge>
        }
      </button>
      <div cDropdownMenu class="bell-menu p-0 pt-0">
        <div cDropdownHeader class="d-flex justify-content-between align-items-center bg-body-tertiary py-2">
          <strong>Notificaciones</strong>
          @if (unread() > 0) {
            <button type="button" class="btn btn-link btn-sm p-0" (click)="markAll($event)">Marcar todas como leídas</button>
          }
        </div>
        @for (n of items(); track n.id) {
          <div class="bell-item px-3 py-2 border-bottom" [class.unread]="!n.read" [class]="n.level" (click)="open(n)">
            <div class="small fw-semibold">{{ n.title }}</div>
            <div class="small text-body-secondary text-truncate">{{ n.message }}</div>
            <div class="small text-body-tertiary">{{ n.date | date: 'dd/MM HH:mm' }}</div>
          </div>
        } @empty {
          <div class="px-3 py-4 text-center small text-body-secondary">Sin notificaciones</div>
        }
      </div>
    </c-dropdown>
  `,
})
export class NotificationBellComponent implements OnInit {
  readonly #service = inject(NotificationService);
  readonly #router = inject(Router);
  readonly #destroyRef = inject(DestroyRef);

  readonly unread = signal(0);
  readonly items = signal<AppNotification[]>([]);

  ngOnInit(): void {
    this.refreshCount();
    const timer = setInterval(() => {
      if (document.visibilityState === 'visible') this.refreshCount();
    }, POLL_MS);
    const onVisible = () => document.visibilityState === 'visible' && this.refreshCount();
    document.addEventListener('visibilitychange', onVisible);
    this.#destroyRef.onDestroy(() => {
      clearInterval(timer);
      document.removeEventListener('visibilitychange', onVisible);
    });
  }

  refreshCount(): void {
    // Silencioso: un fallo de red no debe molestar al usuario
    this.#service.unreadCount().subscribe({ next: (n) => this.unread.set(n), error: () => {} });
  }

  loadList(): void {
    this.#service.list().subscribe({ next: (items) => this.items.set(items), error: () => {} });
  }

  open(n: AppNotification): void {
    if (!n.read) {
      this.#service.markAsRead(n.id).subscribe({ next: () => this.refreshCount(), error: () => {} });
      this.items.update((items) => items.map((i) => (i.id === n.id ? { ...i, read: true } : i)));
    }
    if (n.emissionId && n.family) {
      this.#router.navigate(['/emisiones', n.family], { queryParams: { emision: n.emissionId } });
    }
  }

  markAll(event: Event): void {
    event.stopPropagation();
    this.#service.markAllAsRead().subscribe({
      next: () => {
        this.unread.set(0);
        this.items.update((items) => items.map((i) => ({ ...i, read: true })));
      },
      error: () => {},
    });
  }
}

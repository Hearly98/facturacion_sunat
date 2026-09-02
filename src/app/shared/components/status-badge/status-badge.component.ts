import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type StatusBadgeColor = 'success' | 'warning' | 'danger' | 'info' | 'secondary' | 'primary';

/**
 * Badge de estado, puramente presentacional -- NO resuelve qué color corresponde a qué
 * estado (cada módulo tiene su propio esquema: codigo numérico, stateCode string
 * '01'/'02'/'03', boolean active... ver docs/domain/03-cotizacion-workflow.md). El
 * llamador resuelve color/label y este componente solo los pinta.
 */
@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports: [CommonModule],
  template: `<span class="badge" [ngClass]="'bg-' + color">{{ label }}</span>`,
  styles: `
    :host {
      display: inline-block;
    }
  `,
})
export class StatusBadgeComponent {
  @Input() color: StatusBadgeColor = 'secondary';
  @Input() label = '';
}

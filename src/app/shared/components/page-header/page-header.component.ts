import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Encabezado de página: título + botón de acción opcional. Reemplaza el patrón
 * `<h4>{{ title }}</h4>` + botón "Nuevo X" duplicado casi idéntico en ~20 templates.
 * Migración gradual -- ver TODO.md.
 */
@Component({
  selector: 'app-page-header',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-header">
      <h4 class="mb-0">{{ title }}</h4>
      @if (actionLabel) {
        <button type="button" class="btn btn-primary" (click)="action.emit()">
          <ng-content select="[icon]"></ng-content>
          {{ actionLabel }}
        </button>
      }
    </div>
  `,
  styles: `
    :host {
      display: block;
    }
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }
  `,
})
export class PageHeaderComponent {
  @Input() title = '';
  @Input() actionLabel = '';
  @Output() action = new EventEmitter<void>();
}

import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Estado vacío para tablas/listados. Sigue la convención nativa de shared/components/
 * (modal, card): standalone, sin componentes de CoreUI, solo clases Bootstrap.
 */
@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="empty-state">
      <ng-content select="[icon]"></ng-content>
      <p class="empty-state-message">{{ message }}</p>
      @if (actionLabel) {
        <button type="button" class="btn btn-primary btn-sm" (click)="action.emit()">
          {{ actionLabel }}
        </button>
      }
    </div>
  `,
  styles: `
    :host {
      display: block;
    }
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 3rem 1rem;
      text-align: center;
    }
    .empty-state-message {
      margin-top: 0.5rem;
      color: #6c757d;
      font-size: 0.9rem;
    }
  `,
})
export class EmptyStateComponent {
  @Input() message = 'No hay datos';
  @Input() actionLabel = '';
  @Output() action = new EventEmitter<void>();
}

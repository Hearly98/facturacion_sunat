import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Estado de error para tablas/listados que fallaron al cargar. Misma convención nativa
 * que empty-state/modal/card: standalone, sin CoreUI, solo clases Bootstrap.
 */
@Component({
  selector: 'app-error-state',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="error-state">
      <ng-content select="[icon]"></ng-content>
      <p class="error-state-message">{{ message }}</p>
      @if (retryLabel) {
        <button type="button" class="btn btn-outline-danger btn-sm" (click)="retry.emit()">
          {{ retryLabel }}
        </button>
      }
    </div>
  `,
  styles: `
    :host {
      display: block;
    }
    .error-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 3rem 1rem;
      text-align: center;
    }
    .error-state-message {
      margin-top: 0.5rem;
      color: #dc3545;
      font-size: 0.9rem;
    }
  `,
})
export class ErrorStateComponent {
  @Input() message = 'Ocurrió un error al cargar los datos';
  @Input() retryLabel = 'Reintentar';
  @Output() retry = new EventEmitter<void>();
}

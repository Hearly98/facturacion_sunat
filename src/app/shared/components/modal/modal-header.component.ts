import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-modal-header',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="modal-header">
      <h5 class="modal-title">
        <ng-content></ng-content>
      </h5>
      <button
        *ngIf="showClose"
        type="button"
        class="btn-close"
        aria-label="Close"
        (click)="closeClick.emit()"
      ></button>
    </div>
  `,
  styles: `
    .modal-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1rem;
      border-bottom: 1px solid #dee2e6;
    }

    .modal-title {
      margin: 0;
      font-size: 1.25rem;
      font-weight: 500;
      line-height: 1.5;
      color: inherit;
    }

    .btn-close {
      box-sizing: content-box;
      width: 1em;
      height: 1em;
      padding: 0.25em 0.25em;
      color: #000;
      background: transparent url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16' fill='%23000'%3e%3cpath d='M.293.293a1 1 0 0 1 1.414 0L8 6.586 14.293.293a1 1 0 1 1 1.414 1.414L9.414 8l6.293 6.293a1 1 0 0 1-1.414 1.414L8 9.414l-6.293 6.293a1 1 0 0 1-1.414-1.414L6.586 8 .293 1.707a1 1 0 0 1 0-1.414z'/%3e%3c/svg%3e") center/1em auto no-repeat;
      border: 0;
      border-radius: 0.25rem;
      opacity: 0.5;
      cursor: pointer;
    }

    .btn-close:hover,
    .btn-close:focus {
      opacity: 0.75;
    }
  `,
})
export class ModalHeaderComponent {
  @Input() showClose = true;
  @Output() closeClick = new EventEmitter<void>();
}

import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, transition, style, animate } from '@angular/animations';

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="modal-overlay" *ngIf="isOpen()" [@fadeInOut] (click)="onBackdropClick()">
      <div class="modal-container" [ngClass]="'modal-' + size()" (click)="$event.stopPropagation()">
        <ng-content></ng-content>
      </div>
    </div>
  `,
  styles: `
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1050;
    }

    .modal-container {
      background: white;
      border-radius: 0.375rem;
      box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
      max-height: 90vh;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    .modal-sm { width: 300px; }
    .modal-md { width: 500px; }
    .modal-lg { width: 800px; }
    .modal-xl { width: 1000px; }

    @media (max-width: 768px) {
      .modal-sm,
      .modal-md,
      .modal-lg,
      .modal-xl {
        width: 90vw;
        max-width: 100%;
      }
    }
  `,
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('150ms ease-in', style({ opacity: 1 })),
      ]),
      transition(':leave', [
        animate('150ms ease-out', style({ opacity: 0 })),
      ]),
    ]),
  ],
})
export class ModalComponent {
  @Input() isOpen = signal(false);
  @Input() size = signal<ModalSize>('md');
  @Input() closeOnBackdropClick = true;
  @Output() close = new EventEmitter<void>();

  onBackdropClick(): void {
    if (this.closeOnBackdropClick) {
      this.close.emit();
    }
  }
}

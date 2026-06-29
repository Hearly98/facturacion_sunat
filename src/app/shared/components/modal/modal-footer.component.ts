import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-modal-footer',
  standalone: true,
  imports: [CommonModule],
  template: `<ng-content></ng-content>`,
  styles: `
    :host {
      display: block;
      padding: 1rem;
      border-top: 1px solid #dee2e6;
      display: flex;
      gap: 0.5rem;
      justify-content: flex-end;
    }
  `,
})
export class ModalFooterComponent {}

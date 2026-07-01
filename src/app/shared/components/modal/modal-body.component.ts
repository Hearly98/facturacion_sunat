import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-modal-body',
  standalone: true,
  imports: [CommonModule],
  template: `<ng-content></ng-content>`,
  styles: `
    :host {
      display: block;
      flex: 1;
      padding: 1rem;
      overflow-y: auto;
    }
  `,
})
export class ModalBodyComponent {}

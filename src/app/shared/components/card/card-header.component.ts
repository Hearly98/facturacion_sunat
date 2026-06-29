import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-card-header',
  standalone: true,
  imports: [CommonModule],
  template: `<ng-content></ng-content>`,
  styles: `
    :host {
      display: block;
      padding: 1rem;
      margin-bottom: 0;
      background-color: #f8f9fa;
      border-bottom: 1px solid #dee2e6;
    }
  `,
})
export class CardHeaderComponent {}

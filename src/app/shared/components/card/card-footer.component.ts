import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-card-footer',
  standalone: true,
  imports: [CommonModule],
  template: `<ng-content></ng-content>`,
  styles: `
    :host {
      display: block;
      padding: 1rem;
      background-color: #f8f9fa;
      border-top: 1px solid #dee2e6;
    }
  `,
})
export class CardFooterComponent {}

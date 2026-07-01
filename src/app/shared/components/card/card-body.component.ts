import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-card-body',
  standalone: true,
  imports: [CommonModule],
  template: `<ng-content></ng-content>`,
  styles: `
    :host {
      display: block;
      padding: 1rem;
    }
  `,
})
export class CardBodyComponent {}

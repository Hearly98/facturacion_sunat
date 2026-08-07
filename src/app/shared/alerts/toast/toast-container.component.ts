import { Component, inject } from '@angular/core';
import { GlobalNotification } from '../global-notification/global-notification';
import { AppToastComponent } from './toast.component';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [AppToastComponent],
  template: `
    <div class="toast-container">
      @for (toast of notification.toasts(); track toast.id) {
        <app-toast
          [title]="toast.title"
          [message]="toast.message"
          [color]="toast.color"
          [closeButton]="toast.closeButton"
          [leaving]="toast.leaving"
          (closed)="notification.dismiss(toast.id)"
        />
      }
    </div>
  `,
  styles: [
    `
      .toast-container {
        position: fixed;
        top: 1rem;
        right: 1rem;
        z-index: 1080;
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        pointer-events: none;
      }

      .toast-container > * {
        pointer-events: auto;
      }
    `,
  ],
})
export class ToastContainerComponent {
  protected readonly notification = inject(GlobalNotification);
}

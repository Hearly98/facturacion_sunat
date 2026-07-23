import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconDirective } from '@coreui/icons-angular';
import { ToastColor } from './toast.model';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule, IconDirective],
  templateUrl: './toast.component.html',
  styleUrl: './toast.component.scss',
  host: {
    '[class.success]': "color === 'success'",
    '[class.warning]': "color === 'warning'",
    '[class.danger]': "color === 'danger'",
    '[class.info]': "color === 'info'",
    '[class.hiding]': 'leaving',
  },
})
export class AppToastComponent {
  @Input() closeButton = true;
  @Input() title = '';
  @Input() message = '';
  @Input() color: ToastColor = 'info';
  @Input() leaving = false;

  @Output() closed = new EventEmitter<void>();

  handleClose(event: Event): void {
    event.stopPropagation();
    event.preventDefault();
    this.closed.emit();
  }

  getIcon(): string {
    switch (this.color) {
      case 'success':
        return 'cilCheckCircle';
      case 'warning':
        return 'cilWarning';
      case 'danger':
        return 'cilX';
      case 'info':
      default:
        return 'cilInfo';
    }
  }
}

import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  TableDirective,
  ButtonDirective,
  BadgeComponent,
} from '@coreui/angular';
import { IconDirective } from '@coreui/icons-angular';
import { GetEmissionModel } from '../core/models/get-emission.model';
import { EmissionService } from '../core/services/emission.service';
import { GlobalNotification } from '@shared/alerts/global-notification/global-notification';

@Component({
  selector: 'app-emission-list',
  standalone: true,
  imports: [
    CommonModule,
    TableDirective,
    ButtonDirective,
    BadgeComponent,
    IconDirective,
  ],
  templateUrl: './emission-list.component.html',
  styles: ``,
})
export class EmissionListComponent {
  @Input() emissions: GetEmissionModel[] = [];
  @Input() loading = false;
  @Output() refresh = new EventEmitter<void>();

  #service = inject(EmissionService);
  #notification = inject(GlobalNotification);

  getStatusBadgeColor(status: string): string {
    switch (status) {
      case 'emitida':
        return 'warning';
      case 'enviada':
        return 'success';
      case 'error_envio':
        return 'danger';
      default:
        return 'secondary';
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'emitida':
        return 'Emitida';
      case 'enviada':
        return 'Enviada';
      case 'error_envio':
        return 'Error al enviar';
      default:
        return status;
    }
  }

  downloadPdf(emission: GetEmissionModel): void {
    this.#service.downloadPdf(emission.id).subscribe({
      next: (blob) => {
        this.#downloadFile(blob, `factura-${emission.serieNumber}-${emission.correlativeNumber}.pdf`);
        this.#notification.openToastAlert('¡Éxito!', 'PDF descargado correctamente', 'success');
      },
      error: () => {
        this.#notification.openToastAlert('Error', 'Error al descargar PDF', 'danger');
      },
    });
  }

  downloadXml(emission: GetEmissionModel): void {
    this.#service.downloadXml(emission.id).subscribe({
      next: (blob) => {
        this.#downloadFile(blob, `factura-${emission.serieNumber}-${emission.correlativeNumber}.xml`);
        this.#notification.openToastAlert('¡Éxito!', 'XML descargado correctamente', 'success');
      },
      error: () => {
        this.#notification.openToastAlert('Error', 'Error al descargar XML', 'danger');
      },
    });
  }

  downloadCdr(emission: GetEmissionModel): void {
    this.#service.downloadCdr(emission.id).subscribe({
      next: (blob) => {
        this.#downloadFile(blob, `cdr-${emission.serieNumber}-${emission.correlativeNumber}.xml`);
        this.#notification.openToastAlert('¡Éxito!', 'CDR descargado correctamente', 'success');
      },
      error: () => {
        this.#notification.openToastAlert('Error', 'Error al descargar CDR', 'danger');
      },
    });
  }

  #downloadFile(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}

import { Component, inject, Inject, ViewChild, ViewContainerRef } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import {
  ButtonDirective,
  CardBodyComponent,
  CardComponent,
  ColComponent,
  RowComponent,
  TableDirective,
} from '@coreui/angular';
import { IconDirective } from '@coreui/icons-angular';
import { BaseSearchComponent } from '@shared/base/search-base.component';
import { MODULES } from 'src/app/core/config/permissions/modules';
import { PageParamsModel } from '@shared/models/query/page-params.model';
import { PaginatorComponent } from 'src/app/shared/components/paginator/paginator.component';
import { ConfirmService } from '@shared/confirm-modal/core/services/confirm-modal.service';
import { GlobalNotification } from '@shared/alerts/global-notification/global-notification';
import { SerieService } from '../core/services/serie.service';
import { Serie } from '../core/models';
import { SerieModalComponent } from '../components/serie-modal.component';
import { StatusBadgeComponent } from '@shared/components/status-badge/status-badge.component';

@Component({
  selector: 'app-series',
  standalone: true,
  imports: [
    CommonModule,
    RowComponent,
    ColComponent,
    CardComponent,
    CardBodyComponent,
    IconDirective,
    ButtonDirective,
    TableDirective,
    ReactiveFormsModule,
    PaginatorComponent,
    SerieModalComponent,
    StatusBadgeComponent,
  ],
  template: `
    <c-row>
      <c-col>
        <h4>{{ title }}</h4>
      </c-col>
       <c-col class="text-end">
            <button cButton color="primary" (click)="openModal()">
              <svg cIcon name="cilPlus"></svg>
              Nueva Serie
            </button>
          </c-col>
    </c-row>

    <c-card class="mt-3">
      <c-card-body>
        <c-row>
          <c-col sm="12">
            <table cTable [responsive]="true" striped="true">
              <thead>
                <tr>
                  <th>Acciones</th>
                  <th>Código Doc</th>
                  <th>Tipo Documento</th>
                  <th>Serie</th>
                  <th>Correlativo Actual</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                @if(series.length > 0){
@for (serie of series; track serie.id) {
                <tr>
                  <td>
                    <button
                      (click)="openModal(serie.id!)"
                      size="sm"
                      class="me-2"
                      cButton
                      color="info"
                    >
                      <svg cIcon name="cilPencil"></svg>
                    </button>
                    <button (click)="onDelete(serie.id!)" size="sm" cButton color="danger">
                      <svg cIcon name="cilTrash"></svg>
                    </button>
                  </td>
                  <td>{{ serie.code }}</td>
                  <td>{{ getDocumentTypeName(serie.code) }}</td>
                  <td>{{ serie.number }}</td>
                  <td>{{ serie.counter }}</td>
                  <td>
                    <app-status-badge
                      [color]="serie.active ? 'success' : 'danger'"
                      [label]="serie.active ? 'Activo' : 'Inactivo'"
                    ></app-status-badge>
                  </td>
                </tr>
                }
                }@else {
                <tr>
                  <td colspan="6">No hay series registradas</td>
                </tr>
                }

              </tbody>
            </table>
            <app-paginator
              [(page)]="page.page"
              [pageSize]="page.pageSize"
              [total]="total"
              (pageChange)="onPageChange($event)"
            ></app-paginator>
          </c-col>
        </c-row>
      </c-card-body>
    </c-card>
    <app-serie-modal #serieModal></app-serie-modal>
  `,
})
export class SeriesPage extends BaseSearchComponent {
  @ViewChild('serieModal') serieModal!: SerieModalComponent;
  title = 'Series';
  series: Serie[] = [];

  #serieService = inject(SerieService);
  #confirmService = inject(ConfirmService);
  #globalNotification = inject(GlobalNotification);

  constructor(@Inject(ViewContainerRef) viewContainerRef: ViewContainerRef) {
    super(MODULES.ADMINISTRATION, viewContainerRef);
  }

  ngOnInit(): void {
    this.onSearch();
  }

  onSearch(page = 1) {
    const pageSize = 10;
    const pageParams = new PageParamsModel(page, pageSize);
    this.updatePage(pageParams);

    this.#serieService.search(pageParams).subscribe({
      next: (response) => {
        if (response.isValid) {
          this.total = response.data.total;
          this.series = response.data.items;
        }
      },
      error: (error) => {
        this.#globalNotification.openToastAlert('Error', error.messages, 'danger');
      },
    });
  }

  onPageChange(page: number): void {
    this.onSearch(page);
  }

  openModal(id?: number) {
    if (this.serieModal) {
      this.serieModal.openModal(id, () => {
        this.onSearch();
      });
    }
  }

  onDelete(id: number) {
    this.#confirmService
      .open({
        title: 'Eliminar',
        message: '¿Estás seguro de eliminar esta serie?',
        color: 'danger',
        confirmText: 'Si, eliminar',
        cancelText: 'Cancelar',
      })
      .then((confirmed) => {
        if (confirmed) {
          this.#serieService.delete(id).subscribe({
            next: (response) => {
              if (response.isValid) {
                this.#globalNotification.openAlert(response);
                this.onSearch();
              } else {
                this.#globalNotification.openAlert(response);
              }
            },
            error: (error) => {
              this.#globalNotification.openToastAlert('Error', error.messages, 'danger');
            },
          });
        }
      });
  }

  getDocumentTypeName(code: string): string {
    const types: Record<string, string> = {
      '01': 'Factura',
      '03': 'Boleta',
      '07': 'Nota de Crédito',
      '08': 'Nota de Débito',
      '09': 'Guía de Remisión',
      'COT': 'Cotización',
    };
    return types[code] || code;
  }
}

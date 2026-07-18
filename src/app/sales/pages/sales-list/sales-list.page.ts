import { Component, inject, Inject, signal, ViewContainerRef } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import {
  ButtonDirective,
  CardBodyComponent,
  CardComponent,
  ColComponent,
  RowComponent,
  TableDirective,
  TextColorDirective,
  FormCheckComponent,
  FormCheckInputDirective,
  FormCheckLabelDirective,
} from '@coreui/angular';
import { IconDirective } from '@coreui/icons-angular';
import { BaseSearchComponent } from '@shared/base/search-base.component';
import { MODULES } from 'src/app/core/config/permissions/modules';
import { PageParamsModel } from '@shared/models/query/page-params.model';
import { PaginatorComponent } from 'src/app/shared/components/paginator/paginator.component';
import { ConfirmService } from '@shared/confirm-modal/core/services/confirm-modal.service';
import { GlobalNotification } from '@shared/alerts/global-notification/global-notification';
import { SaleService } from '../../core/services/sale.service';
import { SaleModel } from '../../core/models/sale.model';
import { buildFilterForm, filterSort, mapParams } from '../../helpers';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-sales-list',
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
    DatePipe,
    CurrencyPipe,
    TextColorDirective,
    FormCheckComponent,
    FormCheckInputDirective,
    FormCheckLabelDirective,
    RouterLink,
  ],
  template: `
    <c-row>
      <c-col>
        <h4>{{ title() }}</h4>
      </c-col>
    </c-row>

    <c-card class="mt-3">
      <c-card-body>
        <c-row class="g-3 align-items-end" [formGroup]="form">
          <c-col sm="12" md="6" lg="2">
            <label for="fecha_inicio" class="form-label">Rango de Fechas</label>
            <input
              formControlName="fecha_inicio"
              type="date"
              class="form-control"
              id="fecha_inicio"
            />
          </c-col>
          <c-col sm="12" md="6" lg="2">
            <label for="fecha_fin" class="form-label">&nbsp;</label>
            <input formControlName="fecha_fin" type="date" class="form-control" id="fecha_fin" />
          </c-col>
          <c-col sm="12" md="6" lg="3">
            <label for="search" class="form-label">Filtro General</label>
            <input
              formControlName="search"
              type="text"
              class="form-control"
              id="search"
              placeholder="Buscar..."
            />
          </c-col>
          <c-col sm="12" md="6" lg="4">
            <label class="form-label">Filtro de Estados</label>
            <div class="form-control fs-7">
              <div class="d-flex gap-3 align-items-center">
                @for (state of availableStates; track state.id) {
                  <c-form-check>
                    <input
                      cFormCheckInput
                      type="checkbox"
                      [checked]="isEstadoChecked(state.id)"
                      (change)="toggleEstado(state.id)"
                      [id]="'state_' + state.id"
                    />
                    <label cFormCheckLabel [for]="'state_' + state.id" [cTextColor]="state.color">
                      {{ state.nombre }}
                    </label>
                  </c-form-check>
                }
              </div>
            </div>
          </c-col>
          <c-col sm="12" md="6" lg="3">
            <button cButton color="primary" (click)="onSearch()" class="me-2">
              <svg cIcon name="cilSearch"></svg>
              Buscar
            </button>
            <button cButton color="danger" (click)="onClean()">
              <svg cIcon name="cilTrash"></svg>
              Limpiar
            </button>
          </c-col>
        </c-row>
      </c-card-body>
    </c-card>

    <c-card class="mt-3">
      <c-card-body>
        <c-row>
          <c-col sm="12">
            <table cTable [responsive]="true" striped="true">
              <thead>
                <tr>
                  <th>Acciones</th>
                  <th>Nro. Documento</th>
                  <th>Tipo</th>
                  <th>Fecha Emisión</th>
                  <th>Cliente</th>
                  <th>Total</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                @if (sales.length > 0) {
                @for (sale of sales; track sale.venta_id) {
                <tr>
                  <td>
                    <button
                      size="sm"
                      class="me-2"
                      cButton
                      color="secondary"
                      (click)="onPrint(sale.venta_id, sale.numero_completo)"
                    >
                      <svg cIcon name="cilPrint"></svg>
                    </button>
                    <button
                      [routerLink]="'/ver-venta/'+ sale.venta_id"
                      size="sm"
                      class="me-2"
                      cButton
                      color="info"
                    >
                      <svg cIcon name="cilPencil"></svg>
                    </button>
                    <button (click)="onDelete(sale.venta_id)" size="sm" cButton color="danger">
                      <svg cIcon name="cilTrash"></svg>
                    </button>
                  </td>
                  <td>{{ sale.numero_completo }}</td>
                  <td>{{ sale.documento?.nombre }}</td>
                  <td>{{ sale.fecha_emision | date: 'dd/MM/yyyy' }}</td>
                  <td>{{ sale.cliente?.nombre }}</td>
                  <td>{{ sale.venta_total | currency: 'S/. ' }}</td>
                  <td>
                    <span
                      class="badge"
                      [class.bg-warning]="sale.estado?.codigo === 1"
                      [class.bg-success]="sale.estado?.codigo === 2"
                      [class.bg-danger]="sale.estado?.codigo === 3"
                    >
                      {{ sale.estado?.nombre || (sale.est ? 'Activo' : 'Anulado') }}
                    </span>
                  </td>
                </tr>
                }
                }
                @else {
                  <tr>
                    <td colspan="7">
                      No se encontraron resultados
                    </td>
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
  `,
  styles: `
    .fs-7 {
      font-size: 0.875rem;
    }
  `,
})
export class SalesListPage extends BaseSearchComponent {
  title = signal<string>('Historial de Ventas');
  sales: SaleModel[] = [];
  form!: FormGroup;

  availableStates = [
    { id: 2, nombre: 'Pagados', color: 'success' },
    { id: 1, nombre: 'Pendientes', color: 'warning' },
    { id: 3, nombre: 'Anulados', color: 'danger' },
  ];

  #formBuilder = inject(FormBuilder);
  #saleService = inject(SaleService);
  #confirmService = inject(ConfirmService);
  #globalNotification = inject(GlobalNotification);

  constructor(@Inject(ViewContainerRef) viewContainerRef: ViewContainerRef) {
    super(MODULES.SALES, viewContainerRef);
  }

  ngOnInit(): void {
    this.createForm();
    this.onSearch();
  }

  createForm() {
    this.form = this.#formBuilder.group(buildFilterForm());
  }

  toggleEstado(id: number) {
    const currentEstados = this.form.get('estados')?.value || [];
    const index = currentEstados.indexOf(id);
    if (index > -1) {
      currentEstados.splice(index, 1);
    } else {
      currentEstados.push(id);
    }
    this.form.get('estados')?.setValue([...currentEstados]);
  }

  isEstadoChecked(id: number): boolean {
    return (this.form.get('estados')?.value || []).includes(id);
  }

  onSearch(filter = null, page = 1) {
    const sort = filterSort(this.form.value);
    const filterToUse = filter || mapParams(this.form.value);
    const pageSize = 10;
    const pageParams = new PageParamsModel(page, pageSize);
    this.updateFilter(filterToUse);
    this.updateSort(sort);
    this.updatePage(pageParams);
    const params = this.getPageParams();
    const subscription = this.#saleService.search(params).subscribe({
      next: (response) => {
        if (response.isValid) {
          this.total = response.data.total;
          this.sales = response.data.items;
        } else {
          console.error(response);
        }
      },
      error: (response) => {
        console.error(response.messages);
      },
    });
    this.subscriptions.push(subscription);
  }

  onPageChange(page: number): void {
    this.onSearch(this.filter, page);
  }

  onClean() {
    this.form.reset();
    this.form.patchValue({
      order: 'desc',
      estados: [2, 1],
    });
    this.onSearch();
  }

  onDelete(id: number) {
    this.#confirmService
      .open({
        title: 'Anular Venta',
        message: '¿Estás seguro de anular esta venta?',
        color: 'danger',
        confirmText: 'Si, anular',
        cancelText: 'Cancelar',
      })
      .then((confirmed) => {
        if (confirmed) {
          this.#saleService.delete(id).subscribe({
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

  onPrint(id: number, number_serie: string) {
    this.#saleService.print(id).subscribe({
      next: (response) => {
        const blob = response.body as Blob;
        const contentDisposition = response.headers.get('content-disposition');
        let filename = `${number_serie}.pdf`;

        if (contentDisposition) {
          const match = contentDisposition.match(/filename="?([^";\\n]*)"?/);
          if (match && match[1]) {
            filename = match[1];
          }
        }

        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);

        this.#globalNotification.openToastAlert(
          'Éxito',
          'PDF descargado correctamente',
          'success'
        );
      },
      error: (error) => {
        this.#globalNotification.openToastAlert(
          'Error',
          'No se pudo generar el PDF',
          'danger'
        );
      },
    });
  }
}

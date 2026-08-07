import { Component, Inject, inject, signal, ViewChild, ViewContainerRef } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import {
  ButtonDirective,
  CardBodyComponent,
  CardComponent,
  ColComponent,
  RowComponent,
  TableDirective,
} from '@coreui/angular';
import { IconDirective } from '@coreui/icons-angular';
import { TypedFormGroup } from '@shared/types/types-form';
import { MODULES } from 'src/app/core/config/permissions/modules';
import { PaginatorComponent } from 'src/app/shared/components/paginator/paginator.component';
import { PageParamsModel } from '@shared/models/query/page-params.model';
import { BaseSearchComponent } from '@shared/base/search-base.component';
import { Supplier } from '../core/models';
import { SupplierService } from '../core/services/supplier.service';
import { FilterForm } from '../core/types/filter-form';
import { buildFilterForm, filterSort, mapParams } from '../helpers';
import { SupplierNewEditModalComponent } from '../component/supplier-new-edit-modal.component';
import { ConfirmService } from '@shared/confirm-modal/core/services/confirm-modal.service';
import { GlobalNotification } from '@shared/alerts/global-notification/global-notification';
@Component({
  selector: 'app-supplier',
  imports: [
    RowComponent,
    ColComponent,
    CardComponent,
    CardBodyComponent,
    IconDirective,
    ButtonDirective,
    TableDirective,
    ReactiveFormsModule,
    PaginatorComponent,
    SupplierNewEditModalComponent,
  ],
  template: `
    <c-row>
      <c-col>
        <h4>{{ title() }}</h4>
      </c-col>
      <c-col class="text-end">
        <button cButton color="primary" (click)="openModal()">
          <svg cIcon name="cilPlus"></svg>
          Nuevo Registro
        </button>
      </c-col>
    </c-row>

    <c-card class="mt-3">
      <c-card-body>
        <c-row class="g-3 align-items-end" [formGroup]="form">
          <c-col sm="12" md="6" lg="4">
            <label for="">Nombre</label>
            <input formControlName="name" type="text" class="form-control" />
          </c-col>
          <c-col>
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
          <c-col sm="12" md="12" lg="12">
            <table cTable striped="true">
              <thead>
                <tr>
                  <th>Acciones</th>
                  <th>Nombre</th>
                  <th>Documento</th>
                </tr>
              </thead>
              <tbody>
                @if (suppliers.length > 0) {
                  @for (supplier of suppliers; track $index) {
                    <tr>
                      <td>
                        <button
                          (click)="openModal(supplier.id)"
                          size="sm"
                          class="me-2"
                          cButton
                          color="info"
                        >
                          <svg cIcon name="cilPencil"></svg>
                        </button>
                        <button (click)="onDelete(supplier.id)" size="sm" cButton color="danger">
                          <svg cIcon name="cilTrash"></svg>
                        </button>
                      </td>
                      <td>{{ supplier.name }}</td>
                      <td>{{ supplier.document }}</td>
                    </tr>
                  }
                } @else {
                  <tr>
                    <td colspan="2">No hay datos</td>
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
    <app-supplier-new-edit-modal #supplierNewEditModal></app-supplier-new-edit-modal>
  `,
  styles: ``,
})
export class SupplierPage extends BaseSearchComponent {
  @ViewChild('supplierNewEditModal') supplierNewEditModal!: SupplierNewEditModalComponent;
  public form!: TypedFormGroup<FilterForm>;
  #formBuilder = inject(FormBuilder);
  public title = signal('Proveedores');
  #supplierService = inject(SupplierService);
  #confirmService = inject(ConfirmService);
  #globalNotification = inject(GlobalNotification);
  public suppliers: Supplier[] = [];

  constructor(@Inject(ViewContainerRef) viewContainerRef: ViewContainerRef) {
    super(MODULES.CUSTOMER, viewContainerRef);
  }

  ngOnInit(): void {
    this.createForm();
    this.onSearch();
  }

  createForm() {
    this.form = this.#formBuilder.group(buildFilterForm());
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
    const subscription = this.#supplierService.search(params).subscribe({
      next: (response) => {
        if (response.isValid) {
          this.total = response.data.total;
          this.suppliers = response.data.items;
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
    this.onSearch();
  }

  openModal(id?: number) {
    if (this.supplierNewEditModal) {
      this.supplierNewEditModal.openModal(id, () => {
        this.onSearch();
      });
    }
  }

  onDelete(id: number) {
    this.#confirmService
      .open({
        title: 'Eliminar',
        message: '¿Estás seguro de eliminar este registro?',
        color: 'danger',
        confirmText: 'Si, eliminar',
        cancelText: 'Cancelar',
      })
      .then((confirmed) => {
        if (confirmed) {
          this.#supplierService.delete(id).subscribe({
            next: (response) => {
              this.#globalNotification.openAlert(response);
              if (response.isValid) {
                this.onSearch();
              }
            },
            error: (response) => {
              this.#globalNotification.openToastAlert('Error al eliminar', response, 'danger');
            },
          });
        }
      });
  }
}

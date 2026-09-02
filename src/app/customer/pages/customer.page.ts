import { Component, Inject, inject, OnInit, signal, ViewChild, ViewContainerRef } from '@angular/core';
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
import { buildCustomerFilterForm, customerFilterSort, customerMapFilterParams } from '../helpers';
import { PageParamsModel } from '@shared/models/query/page-params.model';
import { BaseSearchComponent } from '@shared/base/search-base.component';
import { CustomerFilterForm } from '../core/types/filter-form';
import { CustomerService } from '../core/services/customer.service';
import { GetCustomer } from '../core/models';
import { ConfirmService } from '@shared/confirm-modal/core/services/confirm-modal.service';
import { GlobalNotification } from '@shared/alerts/global-notification/global-notification';
import { CustomerNewEditModalComponent } from '../components/customer-new-edit-modal.component';
import { EmptyStateComponent } from '@shared/components/empty-state/empty-state.component';
import { ErrorStateComponent } from '@shared/components/error-state/error-state.component';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';

@Component({
  selector: 'app-customer',
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
    CustomerNewEditModalComponent,
    EmptyStateComponent,
    ErrorStateComponent,
    PageHeaderComponent,
  ],
  template: `
    <app-page-header [title]="title" actionLabel="Nuevo Cliente" (action)="openModal()">
      <svg icon cIcon name="cilPlus"></svg>
    </app-page-header>

    <c-card class="mt-3">
      <c-card-body>
        <c-row class="g-3 align-items-end" [formGroup]="form">
          <c-col sm="12" md="6" lg="4">
            <label for="">Nombre</label>
            <input formControlName="firstName" type="text" class="form-control" />
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
                  <th>Razon Social</th>
                  <th>Documento</th>
                  <th>Teléfono</th>
                </tr>
              </thead>
              <tbody>
                @if (hasError()) {
                  <tr>
                    <td colspan="4">
                      <app-error-state (retry)="onSearch()"></app-error-state>
                    </td>
                  </tr>
                } @else if (customers.length > 0) {
                  @for (customer of customers; track $index) {
                    <tr>
                      <td>
                        <button
                          (click)="openModal(customer.id)"
                          size="sm"
                          class="me-2"
                          cButton
                          color="info"
                        >
                          <svg cIcon name="cilPencil"></svg>
                        </button>
                        <button (click)="onDelete(customer.id)" size="sm" cButton color="danger">
                          <svg cIcon name="cilTrash"></svg>
                        </button>
                      </td>
                      <td>{{ customer.businessName }}</td>
                      <td>{{ customer.document }}</td>
                      <td>{{ customer.phone }}</td>
                    </tr>
                  }
                } @else {
                  <tr>
                    <td colspan="4">
                      <app-empty-state message="No hay clientes registrados"></app-empty-state>
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
    <app-customer-new-edit-modal #customerNewEditModal></app-customer-new-edit-modal>
  `,
  styles: ``,
})
export class CustomerPage extends BaseSearchComponent implements OnInit {
  @ViewChild('customerNewEditModal') customerNewEditModal!: CustomerNewEditModalComponent;
  public form!: TypedFormGroup<CustomerFilterForm>;
  readonly #formBuilder = inject(FormBuilder);
  public title = 'Clientes';
  readonly #customerService = inject(CustomerService);
  public customers: GetCustomer[] = [];
  public hasError = signal(false);
  readonly #confirmService = inject(ConfirmService);
  readonly #globalNotification = inject(GlobalNotification);

  constructor(@Inject(ViewContainerRef) viewContainerRef: ViewContainerRef) {
    super(MODULES.CUSTOMER, viewContainerRef);
  }

  ngOnInit(): void {
    this.createForm();
    this.onSearch();
  }

  createForm() {
    this.form = this.#formBuilder.group(buildCustomerFilterForm());
  }

  onSearch(filter = null, page = 1) {
    const sort = customerFilterSort(this.form.value);
    const filterToUse = filter ?? customerMapFilterParams(this.form.value);
    const pageSize = 10;
    const pageParams = new PageParamsModel(page, pageSize);
    this.updateFilter(filterToUse);
    this.updateSort(sort);
    this.updatePage(pageParams);
    const params = this.getPageParams();
    const subscription = this.#customerService.search(params).subscribe({
      next: (response) => {
        if (response.isValid) {
          this.hasError.set(false);
          this.total = response.data.total;
          this.customers = response.data.items;
        } else {
          this.hasError.set(true);
          this.#globalNotification.openAlert(response);
        }
      },
      error: (response) => {
        this.hasError.set(true);
        this.#globalNotification.openAlert(response.messages);
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
    if (this.customerNewEditModal) {
      this.customerNewEditModal.openModal(id, () => {
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
          this.#customerService.delete(id).subscribe({
            next: (response) => {
              if (response.isValid) {
                this.#globalNotification.openAlert(response);
                this.onSearch();
              } else {
                this.#globalNotification.openAlert(response);
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

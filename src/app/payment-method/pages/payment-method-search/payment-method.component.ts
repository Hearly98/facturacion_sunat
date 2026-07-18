import { Component, Inject, inject, ViewChild, ViewContainerRef } from '@angular/core';
import {
  ButtonDirective,
  CardBodyComponent,
  CardComponent,
  ColComponent,
  RowComponent,
  TableDirective,
} from '@coreui/angular';
import { IconDirective } from '@coreui/icons-angular';
import { TypedFormGroup } from '../../../shared/types/types-form';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { BaseSearchComponent } from '../../../shared/base/search-base.component';
import { MODULES } from '../../../core/config/permissions/modules';
import { PageParamsModel } from '../../../shared/models/query/page-params.model';
import { PaginatorComponent } from '../../../shared/components/paginator/paginator.component';
import { ConfirmService } from '@shared/confirm-modal/core/services/confirm-modal.service';
import { GlobalNotification } from '@shared/alerts/global-notification/global-notification';
import { PaymentMethodService } from '../../core/services/payment-method.service';
import { GetPaymentMethodModel } from '../../core/models';
import { buildFilterForm, filterSort, mapParams } from '../../helpers';
import { FilterForm } from '../../core/types/filter-form';
import { PaymentMethodNewEditModalComponent } from '../../components/payment-method-new-edit-modal/payment-method-new-edit-modal.component';

@Component({
  selector: 'app-payment-method',
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
    PaymentMethodNewEditModalComponent,
  ],
  template: `
    <c-row>
      <c-col>
        <h4>{{ title }}</h4>
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
            <input formControlName="mp_nom" type="text" class="form-control" />
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
                  <th>Código</th>
                  <th>Nombre</th>
                </tr>
              </thead>
              <tbody>
                @for (paymentMethod of paymentMethods; track $index) {
                  <tr>
                    <td>
                      <button
                        (click)="openModal(paymentMethod.mp_id)"
                        size="sm"
                        class="me-2"
                        cButton
                        color="info"
                      >
                        <svg cIcon name="cilPencil"></svg>
                      </button>
                      <button
                        (click)="onDelete(paymentMethod.mp_id)"
                        size="sm"
                        cButton
                        color="danger"
                      >
                        <svg cIcon name="cilTrash"></svg>
                      </button>
                    </td>
                    <td>{{ paymentMethod.mp_cod }}</td>
                    <td>{{ paymentMethod.mp_nom }}</td>
                  </tr>
                }
                @if (paymentMethods.length === 0) {
                  <tr>
                    <td colspan="3">No se encontraron datos</td>
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
    <app-payment-method-new-edit-modal
      #paymentMethodNewEditModal
    ></app-payment-method-new-edit-modal>
  `,
  styles: ``,
})
export class PaymentMethodComponent extends BaseSearchComponent {
  @ViewChild('paymentMethodNewEditModal')
  paymentMethodNewEditModal!: PaymentMethodNewEditModalComponent;
  public form!: TypedFormGroup<FilterForm>;
  #confirmService = inject(ConfirmService);
  #formBuilder = inject(FormBuilder);
  public title = 'Metodos de Pago';
  #paymentMethodService = inject(PaymentMethodService);
  #globalNotification = inject(GlobalNotification);
  public paymentMethods: GetPaymentMethodModel[] = [];

  constructor(@Inject(ViewContainerRef) viewContainerRef: ViewContainerRef) {
    super(MODULES.PAYMENT_METHOD, viewContainerRef);
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
    const subscription = this.#paymentMethodService.search(params).subscribe({
      next: (response) => {
        if (response.isValid) {
          this.total = response.data.total;
          this.paymentMethods = response.data.items;
        } else {
          this.#globalNotification.openAlert(response);
        }
      },
      error: (response) => {
        this.#globalNotification.openToastAlert('Error al buscar', response, 'danger');
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
    if (this.paymentMethodNewEditModal) {
      this.paymentMethodNewEditModal.openModal(id, () => {
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
          this.#paymentMethodService.delete(id).subscribe({
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

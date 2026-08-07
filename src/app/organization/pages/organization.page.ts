import { Component, Inject, OnInit, ViewChild, ViewContainerRef, inject } from '@angular/core';
import {
  RowComponent,
  ColComponent,
  CardComponent,
  CardBodyComponent,
  ButtonDirective,
  TableDirective,
} from '@coreui/angular';
import { IconDirective } from '@coreui/icons-angular';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { BaseSearchComponent } from '../../shared/base/search-base.component';
import { MODULES } from '../../core/config/permissions/modules';
import { TypedFormGroup } from '../../shared/types/types-form';
import { FilterForm } from '../core/types/filter-form';
import { buildFilterForm, filterSort, mapParams } from '../helpers';
import { OrganizationService } from '../core/services/organization.service';
import { PageParamsModel } from '../../shared/models/query/page-params.model';
import { PaginatorComponent } from '../../shared/components/paginator/paginator.component';
import { OrganizationNewEditModalComponent } from '../components/organization-new-edit-modal.component';
import { GetOrganization } from '../core/models/get-organization.model';
import { GlobalNotification } from '@shared/alerts/global-notification/global-notification';
import { ConfirmService } from '@shared/confirm-modal/core/services/confirm-modal.service';

@Component({
  selector: 'app-organization',
  standalone: true,
  imports: [
    RowComponent,
    ColComponent,
    CardComponent,
    CardBodyComponent,
    ButtonDirective,
    TableDirective,
    IconDirective,
    ReactiveFormsModule,
    PaginatorComponent,
    OrganizationNewEditModalComponent,
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
                  <th>RUC</th>
                </tr>
              </thead>
              <tbody>
                @for (item of organizations; track $index) {
                <tr>
                  <td>
                    <button
                      (click)="openModal(item.id)"
                      size="sm"
                      class="me-2"
                      cButton
                      color="info"
                    >
                      <svg cIcon name="cilPencil"></svg>
                    </button>
                    <button (click)="onDelete(item.id)" size="sm" cButton color="danger">
                      <svg cIcon name="cilTrash"></svg>
                    </button>
                  </td>
                  <td>{{ item.name }}</td>
                  <td>{{ item.ruc }}</td>
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

    <app-organization-new-edit-modal #organizationNewEditModal></app-organization-new-edit-modal>
  `,
  styles: ``,
})
export class OrganizationPage extends BaseSearchComponent implements OnInit {
  @ViewChild('organizationNewEditModal')
  organizationNewEditModal!: OrganizationNewEditModalComponent;
  public form!: TypedFormGroup<FilterForm>;
  public title = 'Empresas';
  public organizations: GetOrganization[] = [];
  #formBuilder = inject(FormBuilder);
  #service = inject(OrganizationService);
  #confirmService = inject(ConfirmService);
  #globalNotification = inject(GlobalNotification);
  constructor(@Inject(ViewContainerRef) viewContainerRef: ViewContainerRef) {
    super(MODULES.COMPANY, viewContainerRef);
  }

  ngOnInit(): void {
    this.createForm();
    this.onSearch();
  }

  createForm() {
    this.form = this.#formBuilder.group(buildFilterForm());
  }

  onSearch(filter: any = null, page = 1) {
    const sort = filterSort();
    const filterToUse = filter || mapParams(this.form.value);
    const pageSize = 10;
    const pageParams = new PageParamsModel(page, pageSize);
    this.updateFilter(filterToUse);
    this.updateSort(sort);
    this.updatePage(pageParams);
    const params = this.getPageParams();
    const subscription = this.#service.search(params).subscribe({
      next: (response) => {
        if (response.isValid) {
          this.total = response.data.total;
          this.organizations = response.data.items as any;
        } else {
          console.error(response);
        }
      },
      error: (response) => {
        console.error(response?.messages ?? response);
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
    if (this.organizationNewEditModal) {
      this.organizationNewEditModal.openModal(id, () => {
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
          this.#service.delete(id).subscribe({
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

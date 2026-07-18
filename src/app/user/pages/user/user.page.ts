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
import { PaginatorComponent } from 'src/app/shared/components/paginator/paginator.component';
import { UserNewEditModalComponent } from '../../components/user-new-edit/user-new-edit-modal.component';
import { TypedFormGroup } from '@shared/types/types-form';
import { UserService } from '../../core/services/user.service';
import { MODULES } from 'src/app/core/config/permissions/modules';
import { BaseSearchComponent } from '@shared/base/search-base.component';
import { PageParamsModel } from '@shared/models/query/page-params.model';
import { FilterForm } from '../../core/types';
import { GetUserModel } from '../../core/models';
import { buildFilterForm, filterSort, mapParams } from '../../helpers';
import { GlobalNotification } from '@shared/alerts/global-notification/global-notification';
import { ConfirmService } from '@shared/confirm-modal/core/services/confirm-modal.service';

@Component({
  selector: 'app-user',
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
    UserNewEditModalComponent,
  ],
  template: `<c-row>
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
            <input formControlName="usu_nom" type="text" class="form-control" />
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
                </tr>
              </thead>
              <tbody>
                @for (user of users; track $index) {
                <tr>
                  <td>
                    <button
                      (click)="openModal(user.usu_id)"
                      size="sm"
                      class="me-2"
                      cButton
                      color="info"
                    >
                      <svg cIcon name="cilPencil"></svg>
                    </button>
                    <button (click)="onDelete(user.usu_id)" size="sm" cButton color="danger">
                      <svg cIcon name="cilTrash"></svg>
                    </button>
                  </td>
                  <td>{{ user.usu_nom }}</td>
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
    <app-user-new-edit-modal #userNewEditModal></app-user-new-edit-modal>`,
  styles: ``,
})
export class UserPage extends BaseSearchComponent {
  @ViewChild('userNewEditModal') userNewEditModal!: UserNewEditModalComponent;
  public form!: TypedFormGroup<FilterForm>;
  #formBuilder = inject(FormBuilder);
  title = signal<string>('Usuarios');
  #userService = inject(UserService);
  #confirmService = inject(ConfirmService);
  #globalNotification = inject(GlobalNotification);
  public users: GetUserModel[] = [];
  public roles: any[] = [];
  constructor(@Inject(ViewContainerRef) viewContainerRef: ViewContainerRef) {
    super(MODULES.USERS, viewContainerRef);
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
    const subscription = this.#userService.search(params).subscribe({
      next: (response) => {
        if (response.isValid) {
          this.total = response.data.total;
          this.users = response.data.items;
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
    if (this.userNewEditModal) {
      this.userNewEditModal.openModal(id, () => {
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
          this.#userService.delete(id).subscribe({
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

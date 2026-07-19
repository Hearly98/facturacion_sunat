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
import { buildRolFilterForm, rolFilterSort, mapFilterParams } from '../../helpers';
import { FilterForm } from '../../core/types/filter-form';
import { BaseSearchComponent } from '../../../shared/base/search-base.component';
import { MODULES } from '../../../core/config/permissions/modules';
import { PageParamsModel } from '../../../shared/models/query/page-params.model';
import { PaginatorComponent } from '../../../shared/components/paginator/paginator.component';
import { RolNewEditModal } from '../../components/rol-new-edit-modal/rol-new-edit-modal';
import { RolService } from '../../core/services/rol.service';
import { Rol } from '../../core/models';
import { SucursalService } from 'src/app/sucursal/core/services/sucursal.service';
import { Sucursal } from 'src/app/sucursal/core/models';
import { GlobalNotification } from '@shared/alerts/global-notification/global-notification';
import { ConfirmService } from '@shared/confirm-modal/core/services/confirm-modal.service';

@Component({
  selector: 'app-category',
  imports: [
    RowComponent,
    ColComponent,
    CardComponent,
    CardBodyComponent,
    IconDirective,
    ButtonDirective,
    TableDirective,
    ReactiveFormsModule,
    RolNewEditModal,
    PaginatorComponent,
  ],
  templateUrl: './rol.html',
  styleUrl: './rol.scss',
})
export class RolPage extends BaseSearchComponent {
  @ViewChild('rolNewEditModal') rolNewEditModal!: RolNewEditModal;
  public form!: TypedFormGroup<FilterForm>;
  #formBuilder = inject(FormBuilder);
  public title = 'Roles';
  #rolService = inject(RolService);
  #sucursalService = inject(SucursalService);
  #globalNotification = inject(GlobalNotification);
  #confirmService = inject(ConfirmService);
  public roles: Rol[] = [];
  public sucursales: Sucursal[] = [];

  constructor(@Inject(ViewContainerRef) viewContainerRef: ViewContainerRef) {
    super(MODULES.ADMINISTRATION, viewContainerRef);
  }

  ngOnInit(): void {
    this.createForm();
    this.onSearch();
    this.loadSelectCombos();
    this.#sucursalService;
  }

  createForm() {
    this.form = this.#formBuilder.group(buildRolFilterForm());
  }

  onSearch(filter = null, page = 1) {
    const sort = rolFilterSort(this.form.value);
    const filterToUse = filter || mapFilterParams(this.form.value);
    const pageSize = 10;
    const pageParams = new PageParamsModel(page, pageSize);
    this.updateFilter(filterToUse);
    this.updateSort(sort);
    this.updatePage(pageParams);
    const params = this.getPageParams();
    const subscription = this.#rolService.search(params).subscribe({
      next: (response) => {
        if (response.isValid) {
          this.total = response.data.total;
          this.roles = response.data.items;
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
    if (this.rolNewEditModal) {
      this.rolNewEditModal.openModal(id, () => {
        this.onSearch();
      });
    }
  }

  loadSelectCombos() {
    this.fetchData(this.#sucursalService.getAll(), this.sucursales);
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
          this.#rolService.delete(id).subscribe({
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

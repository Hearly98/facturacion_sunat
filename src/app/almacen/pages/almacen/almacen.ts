import { AlmacenModalNewEdit } from './../../components/almacen-modal-new-edit/almacen-modal-new-edit';
import { Component, Inject, inject, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import {
  ButtonDirective,
  ButtonGroupModule,
  CardBodyComponent,
  CardComponent,
  ColComponent,
  RowComponent,
  TableDirective,
  FormSelectDirective,
  FormLabelDirective,
  BadgeComponent,
  CardHeaderComponent,
} from '@coreui/angular';
import { IconDirective } from '@coreui/icons-angular';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { BaseSearchComponent } from '../../../shared/base/search-base.component';
import { MODULES } from '../../../core/config/permissions/modules';
import { PageParamsModel } from '../../../shared/models/query/page-params.model';
import { FilterForm } from '../../core/types';
import { GetAlmacenModel } from '../../core/models';
import { PaginatorComponent } from '../../../shared/components/paginator/paginator.component';
import { ConfirmService } from '@shared/confirm-modal/core/services/confirm-modal.service';
import { GlobalNotification } from '@shared/alerts/global-notification/global-notification';
import { AlmacenService } from '../../core/services/almacen.service';
import { SucursalService } from '../../../sucursal/core/services/sucursal.service';
import { TypedFormGroup } from '../../../shared/types/types-form';
import { CommonModule } from '@angular/common';
import { Sucursal } from '../../../sucursal/core/models';
import { buildFilterForm, filterSort, mapParams } from '../../helpers';
import { Router } from '@angular/router';

@Component({
  selector: 'app-almacen',
  standalone: true,
  imports: [
    CommonModule,
    RowComponent,
    ColComponent,
    CardComponent,
    CardHeaderComponent,
    CardBodyComponent,
    IconDirective,
    ButtonDirective,
    ButtonGroupModule,
    TableDirective,
    ReactiveFormsModule,
    AlmacenModalNewEdit,
    PaginatorComponent,
    FormSelectDirective,
    FormLabelDirective,
    BadgeComponent,
    CommonModule,
  ],
  templateUrl: './almacen.html',
})
export class AlmacenComponent extends BaseSearchComponent implements OnInit{
  @ViewChild('almacenModal') almacenModal!: AlmacenModalNewEdit;
  public form!: TypedFormGroup<FilterForm>;
  readonly #formBuilder = inject(FormBuilder);
  public title = 'Listado de Almacenes';
  readonly #almacenService = inject(AlmacenService);
  readonly #sucursalService = inject(SucursalService);
  readonly #router = inject(Router);

  public almacenes: GetAlmacenModel[] = [];
  public sucursales: Sucursal[] = [];
  public viewMode: 'cards' | 'table' = 'cards';

  readonly #confirmService = inject(ConfirmService);
  readonly #globalNotification = inject(GlobalNotification);

  constructor(@Inject(ViewContainerRef) viewContainerRef: ViewContainerRef) {
    super(MODULES.ALMACEN, viewContainerRef);
  }

  ngOnInit(): void {
    this.createForm();
    this.loadSucursales();
    this.onSearch();
  }

  loadSucursales() {
    this.#sucursalService.getAll().subscribe((res: any) => {
      if (res.isValid) this.sucursales = res.data;
    });
  }

  createForm() {
    this.form = this.#formBuilder.group(buildFilterForm()) as TypedFormGroup<FilterForm>;
  }

  onSearch(filter = null, page = 1) {
    const sort = filterSort(this.form.value);
    const filterToUse = filter ?? mapParams(this.form.value);
    const pageSize = 10;
    const pageParams = new PageParamsModel(page, pageSize);
    this.updateFilter(filterToUse);
    this.updateSort(sort);
    this.updatePage(pageParams);
    const params = this.getPageParams();
    const subscription = this.#almacenService.search(params).subscribe({
      next: (response) => {
        if (response.isValid) {
          this.total = response.data.total;
          this.almacenes = response.data.items;
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
    this.form.reset({ order: 'desc' });
    this.onSearch();
  }

  openModal(id?: number) {
    if (this.almacenModal) {
      this.almacenModal.openModal(id, () => {
        this.onSearch();
      });
    }
  }

  viewStock(almacen: GetAlmacenModel) {
    this.#router.navigate(['/almacen-stock', almacen.id]);
  }

  onActivate(id: number) {
    this.handleToggleStatus(id, 'activate');
  }

  onDeactivate(id: number) {
    this.handleToggleStatus(id, 'deactivate');
  }
  
  handleToggleStatus(id: number, action: 'activate' | 'deactivate') {
    const isActivate = action === 'activate';

    const config = {
      title: isActivate ? 'Activar' : 'Desactivar',
      message: `¿Estás seguro de ${isActivate ? 'activar' : 'desactivar'} este almacén?`,
      color: isActivate ? 'success' : 'danger',
      confirmText: `Sí, ${isActivate ? 'activar' : 'desactivar'}`,
      cancelText: 'Cancelar',
    };

    const serviceCall = isActivate
      ? this.#almacenService.activate(id)
      : this.#almacenService.deactivate(id);

    this.#confirmService.open(config as any).then((confirmed) => {
      if (!confirmed) return;

      serviceCall.subscribe({
        next: (response) => {
          this.#globalNotification.openAlert(response);

          if (response.isValid) {
            this.onSearch();
          }
        },
        error: (response) => {
          this.#globalNotification.openToastAlert(
            `Error al ${isActivate ? 'activar' : 'desactivar'}`,
            response.error?.message || 'Error',
            'danger',
          );
        },
      });
    });
  }

  setViewMode(mode: 'cards' | 'table') {
    this.viewMode = mode;
  }
}

import {
  Component,
  Inject,
  inject,
  OnInit,
  signal,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { TypedFormGroup } from '@shared/types/types-form';
import { SucursalService } from 'src/app/sucursal/core/services/sucursal.service';
import { UnitOfMeasureService } from '../../core/services/unit-of-measure.service';
import { GetUnitOfMeasureModel } from '../../core/models';
import { GetSucursalModel } from 'src/app/sucursal/core/models';
import { MODULES } from 'src/app/core/config/permissions/modules';
import { BaseSearchComponent } from '@shared/base/search-base.component';
import { buildFilterForm, filterSort, mapParams } from '../../helpers';
import { FilterForm } from '../../core/types';
import { PageParamsModel } from '@shared/models/query/page-params.model';
import { UnitOfMeasureNewEditModalComponent } from '../../components/unit-of-measure-new-edit/unit-of-measure-new-edit-modal.component';
import { CommonModule } from '@angular/common';
import { IconDirective } from '@coreui/icons-angular';
import {
  ButtonModule,
  CardBodyComponent,
  CardComponent,
  ColComponent,
  RowComponent,
  TableDirective,
} from '@coreui/angular';
import { PaginatorComponent } from 'src/app/paginator/paginator.component';
import { ConfirmService } from '@shared/confirm-modal/core/services/confirm-modal.service';
import { GlobalNotification } from '@shared/alerts/global-notification/global-notification';

@Component({
  selector: 'app-unit-of-measure',
  imports: [
    CommonModule,
    IconDirective,
    ButtonModule,
    RowComponent,
    ColComponent,
    CardComponent,
    CardBodyComponent,
    ReactiveFormsModule,
    PaginatorComponent,
    TableDirective,
    UnitOfMeasureNewEditModalComponent,
  ],
  templateUrl: './unit-of-measure.component.html',
})
export class UnitOfMeasurePage extends BaseSearchComponent implements OnInit {
  @ViewChild('unitOfMeasureNewEditModal')
  unitOfMeasureNewEditModal!: UnitOfMeasureNewEditModalComponent;
  public form!: TypedFormGroup<FilterForm>;
  readonly #formBuilder = inject(FormBuilder);
  title = signal('Unidad Medida');
  readonly #unitOfMeasureService = inject(UnitOfMeasureService);
  readonly #sucursalService = inject(SucursalService);
  public units: GetUnitOfMeasureModel[] = [];
  public sucursales: GetSucursalModel[] = [];
  readonly #confirmService = inject(ConfirmService);
  readonly #globalNotification = inject(GlobalNotification);

  constructor(@Inject(ViewContainerRef) viewContainerRef: ViewContainerRef) {
    super(MODULES.UNIT_OF_MEASURE, viewContainerRef);
  }

  ngOnInit(): void {
    this.createForm();
    this.loadSelectCombos();
    this.onSearch();
  }

  createForm() {
    this.form = this.#formBuilder.group(buildFilterForm());
  }

  loadSelectCombos() {
    this.fetchData(this.#sucursalService.getAll(), this.sucursales);
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
    const subscription = this.#unitOfMeasureService.search(params).subscribe({
      next: (response) => {
        if (response.isValid) {
          this.total = response.data.total;
          this.units = response.data.items;
        } else {
          this.#globalNotification.openAlert(response);
        }
      },
      error: (response) => {
        this.#globalNotification.openToastAlert('Error', response.message, 'danger');
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
    if (this.unitOfMeasureNewEditModal) {
      this.unitOfMeasureNewEditModal.openModal(id, () => {
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
          this.#unitOfMeasureService.delete(id).subscribe({
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

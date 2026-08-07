import { Component, Inject, inject, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import {
  ButtonDirective,
  CardBodyComponent,
  CardComponent,
  ColComponent,
  RowComponent,
  TableDirective,
} from '@coreui/angular';
import { IconDirective } from '@coreui/icons-angular';
import { BrandService } from '../../core/services/brand.service';
import { TypedFormGroup } from '../../../shared/types/types-form';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { BaseSearchComponent } from '../../../shared/base/search-base.component';
import { MODULES } from '../../../core/config/permissions/modules';
import { PageParamsModel } from '../../../shared/models/query/page-params.model';
import { BrandNewEditModal } from '../../components/brand-new-edit-modal/brand-new-edit-modal';
import { PaginatorComponent } from '../../../shared/components/paginator/paginator.component';
import { Brand } from '../../core/models';
import { ConfirmService } from '@shared/confirm-modal/core/services/confirm-modal.service';
import { GlobalNotification } from '@shared/alerts/global-notification/global-notification';
import { CommonModule } from '@angular/common';
import {
  buildBrandFilterForm,
  brandMapFilterParams,
  brandFilterSort,
} from '../../helpers';
import { BrandFilterForm } from '../../core/types';

@Component({
  selector: 'app-brand',
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
    BrandNewEditModal,
    PaginatorComponent,
  ],
  templateUrl: './brand.html',
  styleUrl: './brand.scss',
})
export class BrandComponent extends BaseSearchComponent implements OnInit {
  @ViewChild('brandNewEditModal') brandNewEditModal!: BrandNewEditModal;
  public form!: TypedFormGroup<BrandFilterForm>;
  readonly #formBuilder = inject(FormBuilder);
  public title = 'Marcas';
  readonly #brandService = inject(BrandService);
  readonly #confirmService = inject(ConfirmService);
  readonly #globalNotification = inject(GlobalNotification);
  public brands: Brand[] = [];

  constructor(@Inject(ViewContainerRef) viewContainerRef: ViewContainerRef) {
    super(MODULES.MARCA, viewContainerRef);
  }

  ngOnInit(): void {
    this.createForm();
    this.onSearch();
  }

  createForm() {
    this.form = buildBrandFilterForm(this.#formBuilder);
  }

  onSearch(filter = null, page = 1) {
    const sort = brandFilterSort();
    const filterToUse = filter ?? brandMapFilterParams(this.form.value);
    const pageSize = 10;
    const pageParams = new PageParamsModel(page, pageSize);
    this.updateFilter(filterToUse);
    this.updateSort(sort);
    this.updatePage(pageParams);
    const params = this.getPageParams();
    const subscription = this.#brandService.search(params).subscribe({
      next: (response) => {
        if (response.isValid) {
          this.brands = response.data.items || [];
          this.total = response.data.total;
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
    if (this.brandNewEditModal) {
      this.brandNewEditModal.openModal(id, () => {
        this.onSearch();
      });
    }
  }

  onDelete(id: number) {
    this.#confirmService
      .open({
        title: 'Eliminar',
        message: '¿Estás seguro de eliminar esta marca?',
        color: 'danger',
        confirmText: 'Si, eliminar',
        cancelText: 'Cancelar',
      })
      .then((confirmed) => {
        if (confirmed) {
          this.#brandService.delete(id).subscribe({
            next: (response) => {
              if (response.isValid) {
                this.#globalNotification.openAlert(response);
                this.onSearch();
              } else {
                this.#globalNotification.openAlert(response);
              }
            },
            error: (response) => {
              this.#globalNotification.openToastAlert('Error al eliminar', response.error?.message || 'Error', 'danger');
            },
          });
        }
      });
  }
}

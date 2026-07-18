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
import { ProductService } from '../../core/services/product.service';
import { TypedFormGroup } from '../../../shared/types/types-form';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { buildFilterForm, filterSort, mapParams } from '../../helpers';
import { FilterForm } from '../../core/types/filter-form';
import { BaseSearchComponent } from '../../../shared/base/search-base.component';
import { MODULES } from '../../../core/config/permissions/modules';
import { PageParamsModel } from '../../../shared/models/query/page-params.model';
import { ProductNewEditModal } from '../../components/product-new-edit-modal/product-new-edit-modal';
import { PaginatorComponent } from '../../../shared/components/paginator/paginator.component';
import { Product } from '../../core/models';
import { CategoryService } from '../../../category/core/services/category.service';
import { Category } from '../../../category/core/models';
import { SucursalService } from '../../../sucursal/core/services/sucursal.service';
import { Sucursal } from '../../../sucursal/core/models';
import { GlobalNotification } from '@shared/alerts/global-notification/global-notification';
import { ConfirmService } from '@shared/confirm-modal/core/services/confirm-modal.service';

@Component({
  selector: 'app-products',
  imports: [
    RowComponent,
    ColComponent,
    CardComponent,
    CardBodyComponent,
    IconDirective,
    ButtonDirective,
    TableDirective,
    ReactiveFormsModule,
    ProductNewEditModal,
    PaginatorComponent,
  ],
  templateUrl: './products.html',
  styleUrl: './products.scss',
})
export class Products extends BaseSearchComponent implements OnInit {
  @ViewChild('productNewEditModal') productNewEditModal!: ProductNewEditModal;
  public form!: TypedFormGroup<FilterForm>;
  readonly #formBuilder = inject(FormBuilder);
  public title = 'Productos';
  readonly #productService = inject(ProductService);
  readonly #categoryService = inject(CategoryService);
  readonly #sucursalService = inject(SucursalService);
  readonly #confirmService = inject(ConfirmService);
  readonly #globalNotification = inject(GlobalNotification);
  public products: Product[] = [];
  public categorias: Category[] = [];
  public sucursales: Sucursal[] = [];

  constructor(@Inject(ViewContainerRef) viewContainerRef: ViewContainerRef) {
    super(MODULES.PRODUCT, viewContainerRef);
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
    this.fetchData(this.#categoryService.getAll(), this.categorias);
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
    const subscription = this.#productService.search(params).subscribe({
      next: (response) => {
        if (response.isValid) {
          this.total = response.data.total;
          this.products = response.data.items;
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
    this.form.reset({
      order: 'desc',
    });
    this.onSearch();
  }

  openModal(id?: number) {
    if (this.productNewEditModal) {
      this.productNewEditModal.openModal(id, () => {
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
          this.#productService.delete(id).subscribe({
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

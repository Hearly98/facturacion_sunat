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
import { CurrencyService } from '../core/services/currency.service';
import { PageParamsModel } from '../../shared/models/query/page-params.model';
import { PaginatorComponent } from '../../paginator/paginator.component';
import { CurrencyNewEditModalComponent } from '../components/currency-new-edit-modal.component';
import { GetCurrencyModel } from '../core/models/get-currency.model';
import { ConfirmService } from '@shared/confirm-modal/core/services/confirm-modal.service';
import { GlobalNotification } from '@shared/alerts/global-notification/global-notification';

@Component({
  selector: 'app-currency',
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
    CurrencyNewEditModalComponent,
  ],
  templateUrl: './currency.page.html',
  styles: ``,
})
export class CurrencyPage extends BaseSearchComponent implements OnInit {
  @ViewChild('currencyNewEditModal') currencyNewEditModal!: CurrencyNewEditModalComponent;
  public form!: TypedFormGroup<FilterForm>;
  public title = 'Monedas';
  public currencies: GetCurrencyModel[] = [];
  readonly #formBuilder = inject(FormBuilder);
  readonly #service = inject(CurrencyService);
  readonly #confirmService = inject(ConfirmService);
  readonly #globalNotification = inject(GlobalNotification);
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
    const sort = filterSort(this.form.value);
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
          this.currencies = response.data.items as any;
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
    this.form.reset({
      order: 'desc',
    });
    this.onSearch();
  }

  openModal(id?: number) {
    if (this.currencyNewEditModal) {
      this.currencyNewEditModal.openModal(id, () => {
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

import { Component, inject, Inject, ViewContainerRef, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import {
  ButtonDirective,
  CardBodyComponent,
  CardComponent,
  ColComponent,
  FormCheckComponent,
  FormCheckInputDirective,
  FormCheckLabelDirective,
  FormSelectDirective,
  RowComponent,
  TableDirective,
  TextColorDirective,
} from '@coreui/angular';
import { IconDirective } from '@coreui/icons-angular';
import { BaseSearchComponent } from '@shared/base/search-base.component';
import { MODULES } from 'src/app/core/config/permissions/modules';
import { PageParamsModel } from '@shared/models/query/page-params.model';
import { PaginatorComponent } from 'src/app/paginator/paginator.component';
import { ConfirmService } from '@shared/confirm-modal/core/services/confirm-modal.service';
import { GlobalNotification } from '@shared/alerts/global-notification/global-notification';
import { QuotationService } from '../core/services/quotation.service';
import { QuotationModel } from '../core/models/quotation.model';
import { Router } from '@angular/router';
import { buildFilterForm, filterSort, mapParams } from '../helpers';
import { SucursalService } from 'src/app/sucursal/core/services/sucursal.service';
import { GetSucursalModel } from 'src/app/sucursal/core/models';

@Component({
  selector: 'app-quotation-list',
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
    PaginatorComponent,
    FormCheckComponent,
    FormCheckInputDirective,
    FormCheckLabelDirective,
    FormSelectDirective,
    TextColorDirective,
    DatePipe,
    CurrencyPipe,
  ],
  templateUrl: './quotation-list.page.html',
})
export class QuotationListPage extends BaseSearchComponent implements OnInit {
  title = 'Cotizaciones';
  quotations: QuotationModel[] = [];
  form!: FormGroup;
  sucursales: GetSucursalModel[] = [];

  availableStates = [
    { codigo: '01', nombre: 'Pendientes', color: 'warning' },
    { codigo: '02', nombre: 'Facturados', color: 'success' },
    { codigo: '03', nombre: 'Anulados', color: 'danger' },
    { codigo: '04', nombre: 'En Proceso', color: 'warning' },
  ];

  readonly #router = inject(Router);
  readonly #formBuilder = inject(FormBuilder);
  readonly #quotationService = inject(QuotationService);
  readonly #sucursalService = inject(SucursalService);
  readonly #confirmService = inject(ConfirmService);
  readonly #globalNotification = inject(GlobalNotification);

  constructor(@Inject(ViewContainerRef) viewContainerRef: ViewContainerRef) {
    super(MODULES.SALES, viewContainerRef);
  }

  ngOnInit(): void {
    this.form = this.#formBuilder.group(buildFilterForm());
    this.loadSucursales();
    this.onSearch();
  }

  loadSucursales() {
    this.#sucursalService.getAll().subscribe({
      next: (response) => {
        if (response.isValid) {
          this.sucursales = response.data;
        }
      },
    });
  }

  toggleEstado(codigo: string) {
    const currentEstados = this.form.get('estados')?.value || [];
    const index = currentEstados.indexOf(codigo);
    if (index > -1) {
      currentEstados.splice(index, 1);
    } else {
      currentEstados.push(codigo);
    }
    this.form.get('estados')?.setValue([...currentEstados]);
  }

  isEstadoChecked(codigo: string): boolean {
    return (this.form.get('estados')?.value || []).includes(codigo);
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

    this.#quotationService.search(params).subscribe({
      next: (response) => {
        if (response.isValid) {
          this.total = response.data.total;
          this.quotations = response.data.items;
        }
      },
      error: (error) => {
        this.#globalNotification.openAlert(error.error);
      },
    });
  }

  onPageChange(page: number): void {
    this.onSearch(this.filter, page);
  }

  onClean() {
    this.form.reset();
    this.form.patchValue({
      order: 'desc',
      estados: ['02'],
      suc_id: null,
    });
    this.onSearch();
  }

  onDelete(id: number) {
    this.#confirmService
      .open({
        title: 'Eliminar',
        message: '¿Estás seguro de anular esta cotización?',
        color: 'danger',
        confirmText: 'Si, anular',
        cancelText: 'Cancelar',
      })
      .then((confirmed) => {
        if (confirmed) {
          this.#quotationService.anular(id).subscribe({
            next: (response) => {
              if (response.isValid) {
                this.#globalNotification.openAlert(response);
                this.onSearch();
              } else {
                this.#globalNotification.openAlert(response);
              }
            },
            error: (error) => {
              this.#globalNotification.openAlert(error.error);
            },
          });
        }
      });
  }

  onPrint(id: number) {
    this.#quotationService.print(id).subscribe({
      next: (response) => {
        const blob = response.body as Blob;
        const url = window.URL.createObjectURL(blob);
        window.open(url, '_blank');
        window.URL.revokeObjectURL(url);
      },
      error: (error) => {
        this.#globalNotification.openAlert(error.error);
      },
    });
  }

  onEdit(id: number) {
    this.#router.navigate(['/editar-cotizacion', id]);
  }
}

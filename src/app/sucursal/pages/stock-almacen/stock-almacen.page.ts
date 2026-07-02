import { Component, inject, OnInit, ViewContainerRef, Inject } from '@angular/core';
import {
  ButtonDirective,
  CardBodyComponent,
  CardComponent,
  ColComponent,
  RowComponent,
  TableDirective,
  FormSelectDirective,
  SpinnerComponent,
} from '@coreui/angular';
import { IconDirective } from '@coreui/icons-angular';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { BaseComponent } from '../../../shared/base/base.component';
import { MODULES } from '../../../core/config/permissions/modules';
import {
  SucursalService,
} from '../../core/services/sucursal.service';
import { GetSucursalModel, StockBySucursalModel, StockProductoModel } from '../../core/models';
import { CommonModule } from '@angular/common';
import { GlobalNotification } from '@shared/alerts/global-notification/global-notification';
import { buildStockFilterForm } from '../../helpers';
import { StockFilterForm } from '../../core/types';
import { TypedFormGroup } from '../../../shared/types/types-form';

@Component({
  selector: 'app-stock-almacen',
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
    FormSelectDirective,
    SpinnerComponent,
  ],
  templateUrl: './stock-almacen.page.html',
})
export class StockAlmacenPage extends BaseComponent implements OnInit {
  public form!: TypedFormGroup<StockFilterForm>;
  public title = 'Stock por Almacén';
  public stockData?: StockBySucursalModel;
  public filteredProductos: StockProductoModel[] = [];
  public sucursales: GetSucursalModel[] = [];
  public loading = false;

  readonly #sucursalService = inject(SucursalService);
  readonly #formBuilder = inject(FormBuilder);
  readonly #globalNotification = inject(GlobalNotification);

  constructor(@Inject(ViewContainerRef) viewContainerRef: ViewContainerRef) {
    super(MODULES.ALMACEN, viewContainerRef);
  }

  ngOnInit(): void {
    this.loadSucursales();
    this.createForm();
  }

  createForm() {
    this.form = this.#formBuilder.group(buildStockFilterForm());
  }

  loadSucursales() {
    this.#sucursalService.getAll().subscribe({
      next: (response) => {
        if (response.isValid) {
          this.sucursales = response.data;
          if (this.sucursales.length > 0) {
            this.form.patchValue({ sucursalId: this.sucursales[0].id });
            this.onSearch();
          }
        }
      },
      error: (err) => {
        this.#globalNotification.openToastAlert(
          'Error',
          'No se pudo cargar las sucursales',
          'danger'
        );
      },
    });
  }

  onSearch() {
    const sucId = this.form.value.sucursalId;
    if (!sucId) {
      return;
    }

    this.loading = true;
    const subscription = this.#sucursalService.getStockBySucursal(sucId).subscribe({
      next: (response) => {
        this.loading = false;
        if (response.isValid) {
          this.stockData = response.data;
          this.filteredProductos = response.data.productos || [];
        }
      },
      error: (err) => {
        this.loading = false;
        this.#globalNotification.openToastAlert(
          'Error',
          'No se pudo cargar el stock',
          'danger'
        );
      },
    });
    this.subscriptions.push(subscription);
  }

  onClean() {
    this.form.reset();
    this.filteredProductos = this.stockData?.productos || [];
  }

  getTotalStock(): number {
    return this.filteredProductos.reduce((sum, p) => sum + p.stockTotal, 0);
  }
}

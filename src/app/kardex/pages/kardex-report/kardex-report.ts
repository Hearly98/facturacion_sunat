import { Component, Inject, inject, OnInit, ViewContainerRef } from '@angular/core';
import {
  ButtonDirective,
  CardBodyComponent,
  CardComponent,
  ColComponent,
  RowComponent,
  TableDirective,
  FormSelectDirective,
  FormControlDirective,
  FormLabelDirective,
} from '@coreui/angular';
import { IconDirective } from '@coreui/icons-angular';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { BaseComponent } from '../../../shared/base/base.component';
import { MODULES } from '../../../core/config/permissions/modules';
import { KardexService } from '../../core/services/kardex.service';
import { KardexModel } from '../../core/models/kardex.model';
import { buildKardexFilterForm } from '../../helpers/build-kardex-filter-form';
import { ProductService } from '../../../products/core/services/product.service';
import { AlmacenService } from '../../../almacen/core/services/almacen.service';
import { TypedFormGroup } from '../../../shared/types/types-form';
import { KardexFilterForm } from '../../core/types/kardex-filter.form';
import { Product } from '../../../products/core/models';
import { GetAlmacenModel } from '../../../almacen/core/models';

@Component({
  selector: 'app-kardex-report',
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
    FormLabelDirective,
    FormControlDirective,
  ],
  templateUrl: './kardex-report.html',
})
export class KardexReportComponent extends BaseComponent implements OnInit {
  public kardex: KardexModel | null = null;
  public products: Product[] = [];
  public warehouses: GetAlmacenModel[] = [];
  public title = 'Kardex de Inventario';

  #kardexService = inject(KardexService);
  #productService = inject(ProductService);
  #almacenService = inject(AlmacenService);
  #formBuilder = inject(FormBuilder);

  public filterForm!: TypedFormGroup<KardexFilterForm>;

  constructor(@Inject(ViewContainerRef) viewContainerRef: ViewContainerRef) {
    super(MODULES.KARDEX, viewContainerRef);
  }

  ngOnInit(): void {
    this.filterForm = this.#formBuilder.group(buildKardexFilterForm()) as TypedFormGroup<KardexFilterForm>;
    this.loadCombos();
  }

  loadCombos() {
    this.subscriptions.push(
      this.#productService.getAll().subscribe((res) => {
        if (res.isValid) this.products = res.data;
      }),
      this.#almacenService.getAll().subscribe((res) => {
        if (res.isValid) this.warehouses = res.data;
      }),
    );
  }

  onSearch() {
    if (this.filterForm.invalid) {
      this.filterForm.markAllAsTouched();
      return;
    }

    const { productId, warehouseId, dateFrom, dateTo } = this.filterForm.getRawValue();
    const subscription = this.#kardexService
      .getKardex({
        productId: Number(productId),
        warehouseId: Number(warehouseId),
        dateFrom: dateFrom || null,
        dateTo: dateTo || null,
      })
      .subscribe({
        next: (response) => {
          if (response.isValid) this.kardex = response.data;
        },
        error: (err) => console.error(err),
      });
    this.subscriptions.push(subscription);
  }

  onClean() {
    this.filterForm.reset();
    this.kardex = null;
  }
}

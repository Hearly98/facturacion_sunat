import { Component, Inject, inject, OnInit, ViewContainerRef, signal } from '@angular/core';
import {
  ButtonDirective,
  CardBodyComponent,
  CardComponent,
  ColComponent,
  ContainerComponent,
  RowComponent,
  SpinnerComponent,
  TableDirective,
} from '@coreui/angular';
import { IconDirective } from '@coreui/icons-angular';
import { MODULES } from '../../../core/config/permissions/modules';
import {
  FormBuilder,
  ReactiveFormsModule,
  FormArray,
  Validators,
  FormsModule,
} from '@angular/forms';
import {
  buildMovimientoForm,
  movimientoStructure,
  movimientoErrorMessages,
  MovimientoField,
  buildMovimientoFilterForm,
  movementFilterSort,
  movementMapParams,
} from '../../helpers';
import { GetAlmacenModel } from '../../../almacen/core/models';
import { PageParamsModel } from '../../../shared/models/query/page-params.model';
import { CommonModule } from '@angular/common';
import { GlobalNotification } from '@shared/alerts/global-notification/global-notification';
import { ValidationMessagesComponent } from '@shared/components/error-messages/validation-messages.component';
import { PaginatorComponent } from 'src/app/shared/components/paginator/paginator.component';
import { BaseSearchComponent } from '@shared/base/search-base.component';
import { MovimientoService } from '../../core/services/movimiento.service';
import { AlmacenService } from 'src/app/almacen/core/services/almacen.service';
import { ProductService } from 'src/app/products/core/services/product.service';
import { SearchSelectComponent } from '@shared/components/search-select.component';
import { forkJoin } from 'rxjs';
import { MovementType } from '../../core/types/movement-type.enum';
import { GetMovimientoModel } from '../../core/models/get-movimiento.model';
import { MovimientoDetailTableComponent } from '../../components/movimiento-detail-table.component';
import { MovimientoDetailForm } from '../../core/types/movement-detail-form';
import { TypedFormGroup } from '@shared/types/types-form';
import { DateRangePickerComponent } from '@shared/components/date-range-picker/date-range-picker.component';

@Component({
  selector: 'app-movimiento-main',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    CardComponent,
    CardBodyComponent,
    RowComponent,
    TableDirective,
    ColComponent,
    ContainerComponent,
    IconDirective,
    ButtonDirective,
    ValidationMessagesComponent,
    SpinnerComponent,
    PaginatorComponent,
    SearchSelectComponent,
    MovimientoDetailTableComponent,
    DateRangePickerComponent,
  ],
  templateUrl: './movimiento-main.page.html',
})
export class MovimientoMainPage extends BaseSearchComponent implements OnInit {
  readonly #formBuilder = inject(FormBuilder);
  readonly #movementService = inject(MovimientoService);
  readonly #warehouseService = inject(AlmacenService);
  readonly #productService = inject(ProductService);
  readonly #globalNotification = inject(GlobalNotification);

  public activeTab = signal<'create' | 'history'>('create');
  public form = buildMovimientoForm();
  public formFilter = this.#formBuilder.group(buildMovimientoFilterForm());
  public fields = signal<MovimientoField[]>(movimientoStructure);
  readonly messages = movimientoErrorMessages();
  public almacenes: GetAlmacenModel[] = [];
  public movimientos: GetMovimientoModel[] = [];
  public pageList = new PageParamsModel(1, 10);
  public isLoading = signal(false);
  public isLoadingList = signal(false);
  public selectedProduct: any = null;
  public almacenError = signal(false);

  constructor(@Inject(ViewContainerRef) viewContainerRef: ViewContainerRef) {
    super(MODULES.MOVIMIENTO, viewContainerRef);
  }

  ngOnInit(): void {
    forkJoin({
      wareHouse: this.#warehouseService.getAll(),
    }).subscribe(({ wareHouse }) => {
      this.almacenes = wareHouse.data;
    });
    this.form.get('tipoMovimiento')?.valueChanges.subscribe((val) => {
      if (val) this.updateValidators(val);
    });
    this.updateValidators('INGRESO');
    this.onSearch();
  }

  onPrint(id: number, number_serie?: string) {
    this.#movementService.print(id).subscribe({
      next: (response) => {
        const blob = response.body as Blob;
        const contentDisposition = response.headers.get('content-disposition');
        let filename = `${number_serie}.pdf`;

        if (contentDisposition) {
          const match = contentDisposition.match(/filename="?([^";\\n]*)"?/);
          if (match && match[1]) {
            filename = match[1];
          }
        }

        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
      },
      error: (error) => {
        this.#globalNotification.openToastAlert('Error', error.message, 'danger');
      },
    });
  }
  onClean() {
    this.formFilter.reset();
  }

  updateValidators(tipo: string) {
    const almOri = this.form.get('almacen_origen_id');
    const almDes = this.form.get('almacen_destino_id');

    almOri?.clearValidators();
    almDes?.clearValidators();

    if (tipo === 'TRANSFERENCIA') {
      almOri?.setValidators([Validators.required]);
      almDes?.setValidators([Validators.required]);
    } else if (tipo === 'SALIDA') {
      almOri?.setValidators([Validators.required]);
    } else if (tipo === 'INGRESO') {
      almOri?.setValidators([Validators.required]);
    }

    almOri?.updateValueAndValidity();
    almDes?.updateValueAndValidity();

    if (tipo === 'SALIDA') {
      this.form.patchValue({ almacen_destino_id: 0 });
    }
  }

  getWarehouseIdForProductSearch(): number | null {
    const tipo = this.form?.get('tipoMovimiento')?.value as MovementType;
    let warehouseId: number | null = null;

    switch (tipo) {
      case 'TRANSFERENCIA':
      case 'SALIDA':
      case 'INGRESO':
        warehouseId = this.form?.get('almacen_origen_id')?.value as number;
        break;
    }

    return warehouseId;
  }

  getProductSearchFn(): (term: string) => any {
    return (term: string) => {
      const almacenId = this.getWarehouseIdForProductSearch();
      if (!almacenId) {
        this.almacenError.set(true);
        return { data: [] };
      }
      this.almacenError.set(false);
      return this.#productService.searchQuick({
        term,
        almacen_id: almacenId,
      });
    };
  }

  onProductSearchFocus() {
    const almacenId = this.getWarehouseIdForProductSearch();
    if (!almacenId) {
      this.almacenError.set(true);
    } else {
      this.almacenError.set(false);
    }
  }

  onProductSelected(item: any) {
    if (!item) return;
    this.selectedProduct = item;
  }

  getWarehouseLabel(field: MovimientoField): string {
    const tipo = this.form?.get('tipoMovimiento')?.value as MovementType;
    if (field.getLabel) {
      return field.getLabel(tipo);
    }
    return field.label;
  }

  onSearch(filter = null, page = 1) {
    const sort = movementFilterSort();
    const filterToUse = filter ?? movementMapParams(this.formFilter.value);
    const pageSize = 10;
    const pageParams = new PageParamsModel(page, pageSize);
    this.updateFilter(filterToUse);
    this.updateSort(sort);
    this.updatePage(pageParams);
    const params = this.getPageParams();
    this.#movementService.search(params).subscribe({
      next: (response: any) => {
        if (response.isValid) {
          this.total = response.data.total ?? 0;
          this.movimientos = response.data.items;
        } else {
          this.movimientos = [];
        }
      },
      error: () => {
        this.movimientos = [];
      },
    });
  }

  onPageChange(page: number) {
    this.onSearch(this.filter, page);
  }

  get detailsArray(): FormArray<TypedFormGroup<MovimientoDetailForm>> {
    return (this.form.get('detalle') as FormArray<TypedFormGroup<MovimientoDetailForm>>) ?? [];
  }

  onDetailRemoved(index: number) {
    console.log('Producto eliminado en índice:', index);
  }

  onDateRangeChange(range: { start: Date | null; end: Date | null }) {
    const formatDateForApi = (date: Date | null): string => {
      if (!date) return '';
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const day = date.getDate().toString().padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    this.formFilter.patchValue({
      fecha_desde: formatDateForApi(range.start) ?? null,
      fecha_hasta: formatDateForApi(range.end) ?? null,
    });
  }

  addProduct() {
    if (!this.selectedProduct) {
      this.#globalNotification.openToastAlert('Aviso', 'Seleccione un producto primero', 'warning');
      return;
    }

    const exists = this.detailsArray.controls.some(
      (c) => c.get('idProducto')?.value === this.selectedProduct?.id,
    );
    if (exists) {
      this.#globalNotification.openToastAlert(
        'Aviso',
        'El producto ya está en la lista',
        'warning',
      );
      return;
    }

    const detailGroup = this.#formBuilder.group({
      idProducto: [this.selectedProduct.id, Validators.required],
      cantidad: [1, [Validators.required, Validators.min(0.0001)]],
      nombreProducto: [this.selectedProduct.nombre],
      codigoProducto: [this.selectedProduct.codigo],
      costoUnitario: [this.selectedProduct.pcompra],
    });

    this.detailsArray.push(detailGroup);

    this.selectedProduct = null;
  }

  removeDetail(index: number) {
    this.detailsArray.removeAt(index);
  }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    if (this.detailsArray.length === 0) {
      this.#globalNotification.openToastAlert(
        'Error',
        'Debe agregar al menos un producto',
        'danger',
      );
      return;
    }

    this.isLoading.set(true);
    const rawValue = this.form.getRawValue();

    const body = {
      doc_id: rawValue.doc_id,
      fechaEmision: rawValue.fechaEmision,
      tipoMovimiento: rawValue.tipoMovimiento as MovementType,
      almacen_origen_id: rawValue.almacen_origen_id,
      almacen_destino_id: rawValue.almacen_destino_id,
      motivo: rawValue.motivo,
      referencia: rawValue.referencia,
      detalle: rawValue.detalle?.map((d: any) => ({
        idProducto: d.idProducto,
        cantidad: d.cantidad,
        nombreProducto: d.nombreProducto,
        codigoProducto: d.codigoProducto,
        costoUnitario: d.costoUnitario,
      })),
    };

    const request = body.doc_id
      ? this.#movementService.anular(body.doc_id, 'Actualización')
      : this.#movementService.create(body);

    request.subscribe({
      next: (response: any) => {
        this.isLoading.set(false);
        if (response.isValid) {
          this.#globalNotification.openAlert(response);
          this.form.reset();
          this.detailsArray.clear();
          this.activeTab.set('history');
          this.onSearch();
        } else {
          this.#globalNotification.openAlert(response);
        }
      },
      error: (err) => {
        this.isLoading.set(false);
        this.#globalNotification.openAlert(err.error);
      },
    });
  }
}

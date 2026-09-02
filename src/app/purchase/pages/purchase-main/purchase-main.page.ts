import { Component, inject, Inject, OnInit, signal, ViewContainerRef } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  ButtonDirective,
  CardBodyComponent,
  CardComponent,
  ColComponent,
  ContainerComponent,
  RowComponent,
  TableDirective,
  TextColorDirective,
  FormCheckComponent,
  FormCheckInputDirective,
  FormCheckLabelDirective,
} from '@coreui/angular';
import { IconDirective } from '@coreui/icons-angular';
import { BaseSearchComponent } from '@shared/base/search-base.component';
import { MODULES } from 'src/app/core/config/permissions/modules';
import { SelectOption } from '@shared/types';
import { TypedFormGroup } from '@shared/types/types-form';
import { SearchSelectComponent } from '@shared/components/search-select.component';
import { PurchaseDetailTableComponent } from 'src/app/purchase-detail/components/purchase-detail-table.component';
import { PurchaseDetailForm } from 'src/app/purchase-detail/core/types';
import { buildPurchaseDetailForm } from 'src/app/purchase-detail/helpers';
import { PaginatorComponent } from 'src/app/shared/components/paginator/paginator.component';
import { GlobalNotification } from '@shared/alerts/global-notification/global-notification';
import { mapToSelectOption } from '@shared/functions';
import { ConfirmService } from '@shared/confirm-modal/core/services/confirm-modal.service';
import { PurchaseService } from '../../core/services/purchase.service';
import { PurchaseCreateDto } from '../../core/purchase-create-dto';
import { buildPurchaseForm } from '../../helpers/build-purchase-form';
import { purchaseStructure, buildFilterForm, filterSort, mapParams } from '../../helpers';
import { PageParamsModel } from '@shared/models/query/page-params.model';
import { CurrencyService } from 'src/app/currency/core/services/currency.service';
import { SupplierService } from 'src/app/supplier/core/services/supplier.service';
import { ProductService } from 'src/app/products/core/services/product.service';
import { DocumentTypeService } from 'src/app/document-type/core/services/document-type.service';
import { PaymentMethodService } from 'src/app/payment-method/core/services/payment-method.service';
import { SucursalService } from 'src/app/sucursal/core/services/sucursal.service';
import { AlmacenService } from 'src/app/almacen/core/services/almacen.service';
import { DateRangePickerComponent } from '@shared/components/date-range-picker/date-range-picker.component';
import { AuthService } from 'src/app/core/auth/services/auth.service';
import { forkJoin } from 'rxjs';
import { PurchaseModel } from '../../core/models/purchase.model';
import { CurrencyPipe } from '@shared/pipes/currency.pipe';

@Component({
  selector: 'app-purchase-main',
  standalone: true,
  imports: [
    CommonModule,
    RowComponent,
    ColComponent,
    ContainerComponent,
    CardComponent,
    CardBodyComponent,
    IconDirective,
    ButtonDirective,
    ReactiveFormsModule,
    SearchSelectComponent,
    PurchaseDetailTableComponent,
    TableDirective,
    TextColorDirective,
    FormCheckComponent,
    FormCheckInputDirective,
    FormCheckLabelDirective,
    PaginatorComponent,
    DatePipe,
    CurrencyPipe,
    DateRangePickerComponent,
  ],
  templateUrl: './purchase-main.page.html',
})
export class PurchaseMainPage extends BaseSearchComponent implements OnInit {
  public activeTab = signal<'create' | 'history'>('create');
  public isLoadingList = signal(false);
  public purchases: PurchaseModel[] = [];
  public totalList = 0;
  public pageList = new PageParamsModel(1, 10);

  public isLoadingForm = signal(false);
  public form!: FormGroup;
  public selectedProduct: any = null;
  public sucursalOptions = signal<SelectOption[]>([]);
  public almacenOptions = signal<SelectOption[]>([]);
  public almacenError = signal(false);
  public selectedProductStock = signal<number | null>(null);

  public structure = signal(purchaseStructure());
  public title = signal<string>('Historial de Compras');

  availableStates = [
    { id: 1, nombre: 'Pendientes', color: 'warning' },
    { id: 2, nombre: 'Pagados', color: 'success' },
    { id: 3, nombre: 'Anulados', color: 'danger' },
    { id: 4, nombre: 'En Pago', color: 'info' },
  ];

  readonly #formBuilder = inject(FormBuilder);
  readonly #purchaseService = inject(PurchaseService);
  readonly #currencyService = inject(CurrencyService);
  readonly #supplierService = inject(SupplierService);
  readonly #paymentMethodService = inject(PaymentMethodService);
  readonly #productService = inject(ProductService);
  readonly #documentTypeService = inject(DocumentTypeService);
  readonly #sucursalService = inject(SucursalService);
  readonly #almacenService = inject(AlmacenService);
  readonly #globalNotification = inject(GlobalNotification);
  readonly #confirmService = inject(ConfirmService);
  readonly #authService = inject(AuthService);
  readonly #router = inject(Router);
  readonly #activatedRoute = inject(ActivatedRoute);

  constructor(@Inject(ViewContainerRef) viewContainerRef: ViewContainerRef) {
    super(MODULES.PURCHASE, viewContainerRef);
  }

  ngOnInit(): void {
    this.loadSelectCombos();
    this.loadForm();
    this.loadListData();
    // Al volver de la vista de edición de Compra (ruta independiente), aterrizar en Historial
    // en vez del tab "Nueva Compra" por defecto.
    if (this.#activatedRoute.snapshot.queryParams['tab'] === 'history') {
      this.activeTab.set('history');
    }
  }

  loadForm() {
    this.form = this.#formBuilder.group(buildPurchaseForm());
    this.form.get('suc_id')?.valueChanges.subscribe((value) => {
      if (value) {
        this.loadAlmacenesBySucursal(value);
      }
    });
  }

  loadListData() {
    this.onSearch();
  }

  get detailsArray(): FormArray<TypedFormGroup<PurchaseDetailForm>> {
    return this.form.get('detalles') as FormArray<TypedFormGroup<PurchaseDetailForm>>;
  }

  serviceMap: Record<string, any> = {
    providerSearch: (term: string) => this.#supplierService.searchQuick(term),
    productSearch: (term: string) =>
      this.#productService.searchQuick({
        term,
        almacen_id: this.form.get('almacen_id')?.value,
      }),
  };

  getProductSearchFn(): (term: string) => any {
    return (term: string) => {
      if (!this.form.get('almacen_id')?.value) {
        this.almacenError.set(true);
        return { data: [] };
      }
      this.almacenError.set(false);
      return this.#productService.searchQuick({
        term,
        almacen_id: this.form.get('almacen_id')?.value,
      });
    };
  }

  patchSupplier(item: any) {
    this.form.patchValue({
      prov_documento: item.document,
      tip_id: item.documentTypeId,
      prov_direcc: item.address,
      prov_correo: item.email,
      prov_telf: item.phone,
    });
  }

  loadAlmacenesBySucursal(sucId: number) {
    this.#almacenService.getBySucursal(sucId).subscribe({
      next: (response) => {
        const almacenOptions = mapToSelectOption(response.data, 'id', 'nombre');
        this.almacenOptions.set(almacenOptions);
      },
    });
  }

  onProductSearchFocus() {
    if (!this.form.get('almacen_id')?.value) {
      this.almacenError.set(true);
    }
  }

  onSelectItem(formControlName: string, item: any) {
    if (!item) return;

    if (formControlName === 'prod_id') {
      this.form.patchValue({
        prod_id: item.id,
      });
      this.selectedProduct = item;
      this.selectedProductStock.set(item.stock);
      return;
    }

    if (formControlName === 'prov_id') {
      this.form.patchValue({ prov_id: item.id });
      this.patchSupplier(item);
      return;
    }

    const control = this.form.get(formControlName);
    if (control) {
      control.setValue(item[formControlName]);
    }
  }

  addProductToDetail() {
    if (!this.selectedProduct) return;

    const exists = this.detailsArray.controls.some(
      (control) => control.value.prod_id === this.selectedProduct.id,
    );

    if (exists) {
      this.#globalNotification.openToastAlert(
        'Aviso',
        'Este producto ya ha sido agregado',
        'warning',
      );
      return;
    }

    const detailForm = buildPurchaseDetailForm({
      prod_id: this.selectedProduct.id,
      cantidad: 1,
      prod_nom: this.selectedProduct.nombre,
      prod_cod_interno: this.selectedProduct.codigo,
      unidad: this.selectedProduct.unidad,
      costo_unitario: this.selectedProduct.pcompra,
      precio_compra: null,
      dscto: null,
      precio_unitario: null,
    });

    this.detailsArray.push(detailForm as any);

    this.form.get('prod_id')?.setValue(null);
    this.selectedProduct = null;
    this.selectedProductStock.set(null);
  }

  onDetailRemoved(index: number) {
    console.log('Producto eliminado en índice:', index);
  }

  loadSelectCombos() {
    forkJoin({
      currencies: this.#currencyService.getAll(),
      paymentMethods: this.#paymentMethodService.getAll(),
      documentTypes: this.#documentTypeService.getAll(),
      sucursales: this.#sucursalService.getAll(),
    }).subscribe(({ currencies, paymentMethods, documentTypes, sucursales }) => {
      this.sucursalOptions.set(
        sucursales.data.map((item: any) => ({ value: item.id, label: item.name })),
      );
      this.structure.set(
        purchaseStructure(currencies.data, paymentMethods.data, documentTypes.data),
      );
    });
  }

  save() {
    if (this.form.invalid || this.detailsArray.length === 0) {
      this.#globalNotification.openToastAlert(
        'Validación',
        'Complete todos los campos requeridos y agregue al menos un producto',
      );
      this.form.markAllAsTouched();
      return;
    }

    const purchaseData: PurchaseCreateDto = {
      idSucursal: this.form.value.suc_id,
      idUsuario: this.#authService.user()?.id ?? 0,
      idAlmacen: this.form.value.almacen_id,
      idDocumento: this.form.value.doc_id,
      idProveedor: this.form.value.prov_id,
      idMetodoPago: this.form.value.mp_cod ? Number(this.form.value.mp_cod) : null,
      idMoneda: this.form.value.mon_id,
      numero: this.form.value.numero,
      fechaEmision: this.form.value.fechaEmision,
      comentario: this.form.value.compr_coment,
      afectaStock: this.form.value.afecta_stock,
      detalles: this.detailsArray.getRawValue().map((v) => {
        return {
          idProducto: v.prod_id,
          cantidad: v.cantidad,
          precioCompra: v.precio_compra,
          descuento: v.dscto,
        };
      }),
    };

    this.isLoadingForm.set(true);

    this.#purchaseService.create(purchaseData).subscribe({
      next: (response) => {
        this.isLoadingForm.set(false);
        if (response.isValid) {
          this.#globalNotification.openAlert(response);
          this.resetForm();
          this.activeTab.set('history');
          this.onSearch();
        } else {
          this.#globalNotification.openAlert(response);
        }
      },
      error: (error: any) => {
        this.isLoadingForm.set(false);
        this.#globalNotification.openToastAlert('Error', error.messages, 'danger');
      },
    });
  }

  resetForm() {
    this.form.reset();
    this.detailsArray.clear();
    this.selectedProduct = null;
    this.selectedProductStock.set(null);
  }

  toggleEstado(id: number) {
    const currentEstados = this.formList.get('estados')?.value || [];
    const index = currentEstados.indexOf(id);
    if (index > -1) {
      currentEstados.splice(index, 1);
    } else {
      currentEstados.push(id);
    }
    this.formList.get('estados')?.setValue([...currentEstados]);
  }

  isEstadoChecked(id: number): boolean {
    return (this.formList.get('estados')?.value || []).includes(id);
  }

  formList!: FormGroup;

  onSearch(filter = null, page: number = 1) {
    if (!this.formList) {
      this.formList = this.#formBuilder.group(buildFilterForm());
    }

    const sort = filterSort(this.formList.value) as { property: string; direction: string }[];
    const filterToUse = filter ?? mapParams(this.formList.value);
    const pageSize = 10;
    const pageParams = new PageParamsModel(page, pageSize);

    this.pageList = pageParams;

    const params = {
      filter: filterToUse,
      page: { page, pageSize },
      sort,
    };

    this.isLoadingList.set(true);
    this.#purchaseService.search(params).subscribe({
      next: (response) => {
        this.isLoadingList.set(false);
        if (response.isValid) {
          this.totalList = response.data.total;
          this.purchases = response.data.items;
        }
      },
      error: () => {
        this.isLoadingList.set(false);
      },
    });
  }

  onPageChange(page: number): void {
    this.onSearch(null, page);
  }

  onClean() {
      this.formList.reset();
      this.onSearch();
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
          this.#purchaseService.delete(id).subscribe({
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

  onPrint(id: number, number_serie: string) {
    this.#purchaseService.print(id).subscribe({
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

  onEdit(id: number) {
    this.#router.navigate(['/compras', id, 'editar']);
  }

  onDateRangeChange(range: { start: Date | null; end: Date | null }) {
    const formatDateForApi = (date: Date | null): string => {
      if (!date) return '';
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const day = date.getDate().toString().padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    this.formList.patchValue({
      fecha_desde: formatDateForApi(range.start) ?? null,
      fecha_hasta: formatDateForApi(range.end) ?? null,
    });
  }
}

import { Component, inject, Inject, OnInit, signal, ViewContainerRef } from '@angular/core';
import {
  CardBodyComponent,
  CardComponent,
  ColComponent,
  ContainerComponent,
  RowComponent,
  ButtonDirective,
  FormCheckComponent,
  FormCheckInputDirective,
  FormCheckLabelDirective,
} from '@coreui/angular';
import { purchaseStructure } from '../../helpers';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { TypedFormGroup } from '@shared/types/types-form';
import { PurchaseForm } from '../../core/purchase.form';
import { BaseComponent } from '@shared/base/base.component';
import { MODULES } from 'src/app/core/config/permissions/modules';
import { buildPurchaseForm } from '../../helpers/build-purchase-form';
import { CurrencyService } from 'src/app/currency/core/services/currency.service';
import { SelectOption } from '@shared/types';
import { DocumentService } from 'src/app/document/core/services/document.service';
import { SearchSelectComponent } from '@shared/components/search-select.component';
import { SupplierService } from 'src/app/supplier/core/services/supplier.service';
import { ProductService } from 'src/app/products/core/services/product.service';
import { DocumentTypeService } from 'src/app/document-type/core/services/document-type.service';
import { CommonModule } from '@angular/common';
import { PurchaseDetailTableComponent } from 'src/app/purchase-detail/components/purchase-detail-table.component';
import { PurchaseDetailCreteDTOForm, PurchaseDetailForm } from 'src/app/purchase-detail/core/types';
import { buildPurchaseDetailForm } from 'src/app/purchase-detail/helpers';
import { IconDirective } from '@coreui/icons-angular';
import { PaymentMethodService } from 'src/app/payment-method/core/services/payment-method.service';
import { SucursalService } from 'src/app/sucursal/core/services/sucursal.service';
import { AlmacenService } from 'src/app/almacen/core/services/almacen.service';
import { ProductoAlmacenService } from 'src/app/almacen/core/services/producto-almacen.service';
import { PurchaseCreateDto } from '../../core/purchase-create-dto';
import { PurchaseService } from '../../core/services/purchase.service';
import { GlobalNotification } from '@shared/alerts/global-notification/global-notification';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-new-purchase',
  standalone: true,
  imports: [
    CommonModule,
    RowComponent,
    ColComponent,
    ContainerComponent,
    CardComponent,
    CardBodyComponent,
    ReactiveFormsModule,
    SearchSelectComponent,
    IconDirective,
    PurchaseDetailTableComponent,
    ButtonDirective,
    FormCheckComponent,
    FormCheckInputDirective,
    FormCheckLabelDirective,
  ],
  template: `
    <c-container [formGroup]="form">
      @for (item of structure(); track $index) {
        <c-card class="mb-4">
          <c-card-body>
            <c-row>
              <c-col [md]="12">
                <h5>{{ item.title }}</h5>
              </c-col>
            </c-row>
            <c-row>
              @for (control of item.controls; track $index) {
                <c-col [md]="control.col">
                  <label [for]="control.formControlName">{{ control.label }}</label>
                  @switch (control.type) {
                    @case ('search-select') {
                      <app-search-select
                        [placeholder]="control.label"
                        [bindLabel]="control.bindLabel"
                        [bindValue]="control.bindValue"
                        [serviceFn]="getProductSearchFn()"
                        [disabled]="false"
                        [showError]="control.formControlName === 'prod_id' && almacenError()"
                        [errorMessage]="almacenError() ? 'Seleccione un almacén primero' : ''"
                        (onFocus)="onProductSearchFocus()"
                        (itemSelected)="onSelectItem(control.formControlName, $event)"
                      ></app-search-select>
                    }
                    @case ('select') {
                      <select
                        class="form-control form-select"
                        [class.is-invalid]="control.formControlName !== 'suc_id' && almacenError()"
                        [formControlName]="control.formControlName"
                        (change)="onSelectChange(control.formControlName, $event)"
                      >
                        <option [ngValue]="null">Seleccione</option>
                        @for (option of control.options; track $index) {
                          <option [ngValue]="option.value">{{ option.label }}</option>
                        }
                      </select>
                      @if (control.formControlName === 'prod_id' && almacenError()) {
                        <div class="invalid-feedback d-block">Seleccione una sucursal primero</div>
                      }
                    }
                    @case ('checkbox') {
                      <c-form-check class="mt-2">
                        <input
                          cFormCheckInput
                          type="checkbox"
                          [formControlName]="control.formControlName"
                          [id]="control.formControlName"
                        />
                        <label cFormCheckLabel [for]="control.formControlName">{{
                          control.label
                        }}</label>
                      </c-form-check>
                    }
                    @default {
                      <input
                        [formControlName]="control.formControlName"
                        [placeholder]="control.placeholder"
                        [type]="control.type"
                        class="form-control"
                      />
                    }
                  }
                </c-col>
              }
            </c-row>
          </c-card-body>
        </c-card>
      }

      <!-- Agregar Producto - Sección directa -->
      <c-card class="mb-4">
        <c-card-body>
          <c-row>
            <c-col [md]="12">
              <h5>Agregar Producto</h5>
            </c-col>
          </c-row>
          <c-row>
            <c-col [md]="4">
              <label for="suc_id">Sucursal</label>
              <select
                class="form-control form-select"
                formControlName="suc_id"
                (change)="onSucursalChange($event)"
              >
                <option [ngValue]="null">Seleccione</option>
                @for (option of sucursalOptions(); track $index) {
                  <option [ngValue]="option.value">{{ option.label }}</option>
                }
              </select>
            </c-col>
            <c-col [md]="4">
              <label for="almacen_id">Almacén</label>
              <select
                class="form-control form-select"
                [class.is-invalid]="almacenError()"
                formControlName="almacen_id"
              >
                <option [ngValue]="null">Seleccione</option>
                @for (option of almacenOptions(); track $index) {
                  <option [ngValue]="option.value">{{ option.label }}</option>
                }
              </select>
            </c-col>
            <c-col [md]="4">
              <label for="prod_id">Producto</label>
              <app-search-select
                placeholder="Producto"
                bindLabel="label"
                bindValue="prod_id"
                [serviceFn]="getProductSearchFn()"
                [disabled]="false"
                [showError]="almacenError()"
                [errorMessage]="almacenError() ? 'Seleccione un almacén primero' : ''"
                (onFocus)="onProductSearchFocus()"
                (itemSelected)="onSelectItem('prod_id', $event)"
              ></app-search-select>
            </c-col>
          </c-row>
          <c-row class="mt-2">
            <c-col [md]="12">
              <c-form-check class="mt-2">
                <input
                  cFormCheckInput
                  type="checkbox"
                  formControlName="afecta_stock"
                  id="afecta_stock"
                />
                <label cFormCheckLabel for="afecta_stock">Afecta Stock</label>
              </c-form-check>
            </c-col>
          </c-row>
          <c-row class="mt-3">
            <c-col [md]="4">
              <button
                type="button"
                cButton
                color="primary"
                (click)="addProductToDetail()"
                [disabled]="!form.value.prod_id || !selectedProduct"
              >
                <svg cIcon name="cilPlus" class="me-2"></svg>
                Agregar Producto
              </button>
            </c-col>
            @if (selectedProduct && selectedProductStock() !== null) {
              <c-col [md]="8">
                <div class="alert alert-info mb-0 py-2">
                  <strong>Stock actual:</strong> {{ selectedProductStock() }} unidades en el almacén
                  seleccionado
                </div>
              </c-col>
            }
          </c-row>
        </c-card-body>
      </c-card>

      <!-- Tabla de detalles -->
      <app-purchase-detail-table
        [detailsArray]="detailsArray"
        (detailRemoved)="onDetailRemoved($event)"
      ></app-purchase-detail-table>

      <!-- Botones de acción -->
      <c-card class="mb-4">
        <c-card-body>
          <c-row class="align-items-end">
            <c-col md="8" sm="12" class="mb-2">
              <label for="">Observaciones</label>
              <textarea class="form-control" formControlName="compr_coment" rows="3"></textarea>
            </c-col>
            <c-col md="4" sm="12" class="gap-2 text-end">
              <button class="me-2" type="button" cButton color="secondary" (click)="cancel()">
                Cancelar
              </button>
              <button
                type="button"
                cButton
                color="success"
                (click)="save()"
                [disabled]="!form.valid || detailsArray.length === 0"
              >
                <svg cIcon name="cilSave" class="me-2"></svg>
                Guardar Compra
              </button>
            </c-col>
          </c-row>
        </c-card-body>
      </c-card>
    </c-container>
  `,
  styles: `
    .gap-2 {
      gap: 0.5rem;
    }
  `,
})
export class NewPurchaseComponent extends BaseComponent implements OnInit {
  structure = signal(purchaseStructure());
  categories = signal<SelectOption[]>([]);
  form!: FormGroup;
  selectedProduct: any = null;
  sucursalOptions = signal<SelectOption[]>([]);
  almacenOptions = signal<SelectOption[]>([]);
  almacenError = signal(false);
  selectedProductStock = signal<number | null>(null);

  #formBuilder = inject(FormBuilder);
  #currencyService = inject(CurrencyService);
  #documentService = inject(DocumentService);
  #supplierService = inject(SupplierService);
  #paymentMethodService = inject(PaymentMethodService);
  #productService = inject(ProductService);
  #documentTypeService = inject(DocumentTypeService);
  #sucursalService = inject(SucursalService);
  #almacenService = inject(AlmacenService);
  #productoAlmacenService = inject(ProductoAlmacenService);
  #purchaseService = inject(PurchaseService);
  #globalNotification = inject(GlobalNotification);
  constructor(@Inject(ViewContainerRef) viewContainerRef: ViewContainerRef) {
    super(MODULES.PURCHASE, viewContainerRef);
  }

  ngOnInit() {
    this.form = this.#formBuilder.group(buildPurchaseForm());
    this.loadSelectCombos();
  }

  get detailsArray(): FormArray<TypedFormGroup<PurchaseDetailForm>> {
    return this.form.get('detalles') as FormArray<TypedFormGroup<PurchaseDetailForm>>;
  }

  serviceMap = {
    providerSearch: (term: string) => this.#supplierService.searchQuick(term),
    productSearch: (term: string) =>
      this.#productService.searchQuick({
        term,
        suc_id: this.form.get('suc_id')?.value,
        almacen_id: this.form.get('almacen_id')?.value,
      }),
  };

  patchSupplier(item: any) {
    this.form.patchValue({
      prov_documento: item.prov_documento,
      tip_id: item.tip_id,
      prov_direcc: item.prov_direcc,
      prov_correo: item.prov_correo,
      prov_telf: item.prov_telf,
    });
  }

  isControlDisabled(formControlName: string): boolean {
    if (formControlName === 'prod_id') {
      return false;
    }
    return false;
  }

  hasAlmacenError(): boolean {
    return this.almacenError();
  }

  onAlmacenChange(event: Event) {
    const value = (event.target as HTMLSelectElement).value;
    if (value) {
      this.almacenError.set(false);
      this.form.patchValue({ almacen_id: parseInt(value) });
      this.selectedProductStock.set(null);
      if (this.selectedProduct) {
        this.loadProductStock(this.selectedProduct.prod_id);
      }
    }
  }

  onSelectChange(controlName: string, event: Event) {
    const value = (event.target as HTMLSelectElement).value;

    if (controlName === 'suc_id' && value) {
      this.form.patchValue({ suc_id: parseInt(value), almacen_id: null });
      this.loadAlmacenesBySucursal(parseInt(value));
      this.selectedProductStock.set(null);
      this.selectedProduct = null;
    } else if (controlName === 'almacen_id' && value) {
      this.almacenError.set(false);
      this.form.patchValue({ almacen_id: parseInt(value) });
      this.selectedProductStock.set(null);
      if (this.selectedProduct) {
        this.loadProductStock(this.selectedProduct.prod_id);
      }
    }
  }

  onSucursalChange(event: Event) {
    const value = (event.target as HTMLSelectElement).value;
    if (value) {
      this.form.patchValue({ suc_id: parseInt(value), almacen_id: null });
      this.almacenOptions.set([]);
      this.loadAlmacenesBySucursal(parseInt(value));
      this.selectedProductStock.set(null);
      this.selectedProduct = null;
    }
  }

  loadAlmacenesBySucursal(sucId: number) {
    this.#almacenService.getAll().subscribe({
      next: (response) => {
        const filteredAlmacenes = response.data
          .filter((a: any) => a.suc_id === sucId)
          .map((item: any) => ({ value: item.almacen_id, label: item.name }));
        this.almacenOptions.set(filteredAlmacenes);
      },
    });
  }

  onProductSearchFocus() {
    if (!this.form.get('suc_id')?.value) {
      this.almacenError.set(true);
    }
  }

  getProductSearchFn(): (term: string) => any {
    return (term: string) => {
      if (!this.form.get('suc_id')?.value) {
        this.almacenError.set(true);
        return { data: [] };
      }
      this.almacenError.set(false);
      return this.#productService.searchQuick({
        term,
        suc_id: this.form.get('suc_id')?.value,
        almacen_id: this.form.get('almacen_id')?.value,
      });
    };
  }

  onSelectItem(formControlName: keyof PurchaseForm, item: any) {
    if (!item) return;

    if (formControlName === 'prod_id') {
      this.form.patchValue({
        prod_id: item.prod_id,
      });
      this.selectedProduct = item;
      this.loadProductStock(item.prod_id);
      return;
    }

    const control = this.form.get(formControlName);
    if (control) {
      control.setValue(item[formControlName]);
    }

    if (formControlName === 'prov_id') {
      this.patchSupplier(item);
    }
  }

  loadProductStock(productId: number) {
    const almacen_id = this.form.get('almacen_id')?.value;
    if (!almacen_id) {
      this.selectedProductStock.set(null);
      return;
    }
    this.#productoAlmacenService.getByProducto(productId).subscribe({
      next: (response) => {
        const stockInfo = response.data.find((s: any) => s.almacen_id === almacen_id);
        this.selectedProductStock.set(stockInfo?.stockActual ?? 0);
      },
      error: () => {
        this.selectedProductStock.set(null);
      },
    });
  }

  addProductToDetail() {
    if (!this.selectedProduct) return;

    // Verificar si el producto ya existe en el detalle
    const exists = this.detailsArray.controls.some(
      (control) => control.value.prod_id === this.selectedProduct.prod_id,
    );

    if (exists) {
      alert('Este producto ya ha sido agregado');
      return;
    }

    const detailForm = buildPurchaseDetailForm({
      prod_id: this.selectedProduct.prod_id,
      cantidad: 1,
      prod_nom: this.selectedProduct.prod_nom,
      prod_cod_interno: this.selectedProduct.prod_cod,
      unidad: this.selectedProduct.unidad,
      costo_unitario: this.selectedProduct.pcompra,
      precio_compra: null,
      dscto: null,
      precio_unitario: null,
    });

    this.detailsArray.push(detailForm as any);

    // Limpiar selección
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
      documents: this.#documentService.getAll(),
      paymentMethods: this.#paymentMethodService.getAll(),
      documentTypes: this.#documentTypeService.getAll(),
      sucursales: this.#sucursalService.getAll(),
    }).subscribe(({ currencies, paymentMethods, documentTypes, sucursales }) => {
      this.sucursalOptions.set(
        sucursales.data.map((item: any) => ({ value: item.suc_id, label: item.suc_nom })),
      );
      this.structure.set(
        purchaseStructure(currencies.data, paymentMethods.data, documentTypes.data),
      );
    });
  }

  save() {
    if (this.form.invalid || this.detailsArray.length === 0) {
      alert('Complete todos los campos requeridos y agregue al menos un producto');
      return;
    }
    const purchaseData: PurchaseCreateDto = {
      fechaEmision: this.form.value.fechaEmision,
      numero: this.form.value.numero,
      compr_coment: this.form.value.compr_coment,
      suc_id: this.form.value.suc_id,
      almacen_id: this.form.value.almacen_id,
      prov_id: this.form.value.prov_id,
      doc_id: this.form.value.doc_id,
      mon_id: this.form.value.mon_id,
      mp_cod: this.form.value.mp_cod,
      afecta_stock: this.form.value.afecta_stock,
      detalles: this.detailsArray.getRawValue().map((v) => {
        return {
          prod_id: v.prod_id,
          detc_cant: v.cantidad,
          prod_pcompra: v.precio_compra,
          prod_nom: v.prod_nom,
        };
      }),
    };

    this.#purchaseService.create(purchaseData).subscribe({
      next: (response) => {
        if (response.isValid) {
          this.#globalNotification.openAlert(response);
          this.cancel();
        } else {
          this.#globalNotification.openAlert(response);
        }
      },
      error: (error) => {
        this.#globalNotification.openToastAlert('Error', error.messages, 'danger');
      },
    });
  }

  cancel() {
    // Navegar de vuelta o limpiar el formulario
    this.form.reset();
    this.detailsArray.clear();
  }
}

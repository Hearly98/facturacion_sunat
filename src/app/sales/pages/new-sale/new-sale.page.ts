import { Component, inject, Inject, OnInit, signal, ViewChild, ViewContainerRef } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import {
  ButtonDirective,
  CardBodyComponent,
  CardComponent,
  ColComponent,
  ContainerComponent,
  RowComponent,
  FormCheckComponent,
  FormCheckInputDirective,
  FormCheckLabelDirective,
} from '@coreui/angular';
import { IconDirective } from '@coreui/icons-angular';
import { BaseComponent } from '@shared/base/base.component';
import { MODULES } from 'src/app/core/config/permissions/modules';
import { SelectOption } from '@shared/types';
import { SearchSelectComponent } from '@shared/components/search-select.component';
import { SaleService } from '../../core/services/sale.service';
import { DocumentService } from 'src/app/document/core/services/document.service';
import { CustomerService } from 'src/app/customer/core/services/customer.service';
import { SucursalService } from 'src/app/sucursal/core/services/sucursal.service';
import { ProductService } from 'src/app/products/core/services/product.service';
import { GlobalNotification } from '@shared/alerts/global-notification/global-notification';
import { PaymentMethodService } from 'src/app/payment-method/core/services/payment-method.service';
import { TypedFormGroup } from '@shared/types/types-form';
import { SaleForm } from '../../core/types';
import { buildSaleForm } from '../../helpers';
import { saleStructure } from '../../helpers/sale-structure';
import { SaleDetailForm } from 'src/app/sale-detail/core/types';
import { SaleDetailTableComponent } from 'src/app/sale-detail/components/sale-detail-table.component';
import { mapSaleCreateDto } from '../../helpers/map-sale-create-dto';
import { CurrencyService } from 'src/app/currency/core/services/currency.service';
import { DocumentTypeService } from 'src/app/document-type/core/services/document-type.service';
import { OrganizationService } from 'src/app/organization/core/services/organization.service';
import { AlmacenService } from 'src/app/almacen/core/services/almacen.service';
import { mapToSelectOption } from '@shared/functions';
import { QuotationService } from 'src/app/quotation/core/services/quotation.service';
import { ShippingGuideService } from 'src/app/shipping-guide/core/services/shipping-guide.service';
import { Observable } from 'rxjs';
import { ResponseDto } from '@shared/models/api/response.dto';
import { SearchDocumentModalComponent } from '@shared/components/search-document-modal/search-document-modal.component';
import { QuotationModel } from 'src/app/quotation/core/models/quotation.model';

@Component({
  selector: 'app-new-sale',
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
    ButtonDirective,
    SaleDetailTableComponent,
    FormCheckComponent,
    FormCheckInputDirective,
    FormCheckLabelDirective,
    SearchDocumentModalComponent,
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
                  @if (control.formControlName === 'cot_id') {
                    @if (selectedCotizacion()) {
                      <div class="d-flex align-items-center gap-2">
                        <input
                          class="form-control bg-light"
                          [value]="selectedCotizacion()!.numero_completo"
                          disabled
                        />
                        <button
                          cButton
                          color="secondary"
                          variant="ghost"
                          size="sm"
                          (click)="clearCotizacion()"
                          title="Desvincular"
                        >
                          <svg cIcon name="cilX"></svg>
                        </button>
                      </div>
                    } @else {
                      <button
                        cButton
                        color="primary"
                        variant="outline"
                        class="w-100 justify-content-start"
                        (click)="openCotizacionSearch()"
                      >
                        <svg cIcon name="cilSearch" class="me-2"></svg>
                        Buscar cotización
                      </button>
                    }
                  } @else {
                    @switch (control.type) {
                      @case ('search-select') {
                        <app-search-select
                          [placeholder]="control.label"
                          [bindLabel]="control.bindLabel"
                          [bindValue]="control.bindValue"
                          [serviceFn]="serviceMap[control.serviceFnName]"
                          [disabled]="isControlDisabled(control.formControlName)"
                          (itemSelected)="onSelectItem(control.formControlName, $event)"
                        ></app-search-select>
                      }
                      @case ('select') {
                        <select
                          class="form-control form-select"
                          [formControlName]="control.formControlName"
                        >
                          <option [ngValue]="null">Seleccione</option>
                          @for (option of control.options; track $index) {
                            <option [ngValue]="option.value">{{ option.label }}</option>
                          }
                        </select>
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
                  }
                </c-col>
              }
              <!-- Botón para agregar producto después del search-select de producto -->
              @if (item.title === 'Agregar Producto') {
                <c-col [md]="4" class="mt-4">
                  <label for="" class="d-none"></label>
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
              }
            </c-row>
          </c-card-body>
        </c-card>
      }

      <!-- Tabla de detalles -->
      <app-sale-detail-table
        [detailsArray]="detailsArray"
        (detailRemoved)="onDetailRemoved($event)"
      ></app-sale-detail-table>

      <!-- Botones de acción -->
      <c-card class="mb-4">
        <c-card-body>
          <c-row class="align-items-end">
            <c-col md="8" sm="12" class="mb-2">
              <label for="">Observaciones</label>
              <textarea class="form-control" formControlName="venta_coment" rows="3"></textarea>
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
                Guardar Venta
              </button>
            </c-col>
          </c-row>
        </c-card-body>
      </c-card>
    </c-container>

    <!-- Modal de búsqueda de cotizaciones -->
    <app-search-document-modal #searchDocumentModal></app-search-document-modal>
  `,
  styles: `
    .gap-2 {
      gap: 0.5rem;
    }
  `,
})
export class NewSalePage extends BaseComponent implements OnInit {
  structure = signal(saleStructure());
  form!: FormGroup;
  selectedProduct: any = null;
  showFechaVencimiento = signal(false);
  sucursalOptions = signal<SelectOption[]>([]);
  almacenOptions = signal<SelectOption[]>([]);

  @ViewChild('searchDocumentModal') searchDocumentModal!: SearchDocumentModalComponent;

  // State for document source (cotización/guía)
  selectedCotizacion = signal<QuotationModel | null>(null);
  selectedGuia = signal<any>(null);
  isCotizacionAttached = signal(false);
  isGuiaAttached = signal(false);
  isGuiaWithCotizacion = signal(false);

  #formBuilder = inject(FormBuilder);
  #saleService = inject(SaleService);
  #documentService = inject(DocumentService);
  #customerService = inject(CustomerService);
  #sucursalService = inject(SucursalService);
  #productService = inject(ProductService);
  #paymentMethod = inject(PaymentMethodService);
  #currencyService = inject(CurrencyService);
  #documentTypeService = inject(DocumentTypeService);
  #organizationService = inject(OrganizationService);
  #almacenService = inject(AlmacenService);
  #globalNotification = inject(GlobalNotification);
  #quotationService = inject(QuotationService);
  #shippingGuideService = inject(ShippingGuideService);

  constructor(@Inject(ViewContainerRef) viewContainerRef: ViewContainerRef) {
    super(MODULES.SALES, viewContainerRef);
  }

  ngOnInit() {
    this.form = this.#formBuilder.group(buildSaleForm());
    this.loadSelectCombos();
    this.setupPaymentMethodListener();

    this.form.get('suc_id')?.valueChanges.subscribe((value) => {
      if (value) {
        this.loadAlmacenesBySucursal(value);
      }
    });
  }

  get detailsArray(): FormArray<TypedFormGroup<SaleDetailForm>> {
    return this.form.get('detalles') as FormArray<TypedFormGroup<SaleDetailForm>>;
  }

  serviceMap = {
    customerSearch: (term: string) => this.#customerService.getAll(),
    productSearch: (term: string) =>
      this.#productService.searchQuick({
        term,
        almacen_id: this.form.get('almacen_id')?.value ?? 0,
      }),
    cotizacionSearch: (term: string): Observable<ResponseDto<any>> =>
      this.#quotationService.search({
        filter: { nombre: term, estados: ['01'] },
        sort: [{ property: 'fecha_emision', direction: 'desc' }],
        page: { page: 1, pageSize: 20 },
      }),
    guiaSearch: (term: string): Observable<ResponseDto<any>> =>
      this.#shippingGuideService.search({
        filter: { search: term },
        sort: [{ property: 'fecha_emision', direction: 'desc' }],
        page: { page: 1, pageSize: 20 },
      }),
  };

  patchCustomer(item: any) {
    this.form.patchValue({
      cli_documento: item.cli_documento,
      tip_id: item.tip_id,
      cli_direcc: item.cli_direcc,
      cli_correo: item.cli_correo,
      cli_telf: item.cli_telf,
    });
  }

  isControlDisabled(formControlName: string): boolean {
    if (formControlName === 'prod_id') {
      return !this.form.get('almacen_id')?.value;
    }
    return false;
  }

  onSelectItem(formControlName: keyof SaleForm, item: any) {
    if (!item) return;

    if (formControlName === 'prod_id') {
      this.form.patchValue({
        prod_id: item.prod_id,
      });
      this.selectedProduct = item;
      return;
    }

    // Handle guía selection
    if (formControlName === 'guia_id') {
      this.selectedGuia.set(item);
      this.isGuiaAttached.set(true);

      // Check if guía has cotización
      const hasCotizacion = !!item.cot_id || !!item.cotizacion;
      this.isGuiaWithCotizacion.set(hasCotizacion);

      // Auto-fill cliente
      if (item.cliente) {
        this.form.patchValue({
          cli_id: item.cliente.cli_id,
          cli_documento: item.cliente.cli_documento,
          tip_id: item.cliente.tip_id,
          cli_direcc: item.cliente.cli_direcc,
          cli_correo: item.cliente.cli_correo,
          cli_telf: item.cliente.cli_telf,
        });
      }

      // Populate details from guía
      if (item.detalles && item.detalles.length > 0) {
        this.detailsArray.clear();
        item.detalles.forEach((detalle: any) => {
          const detailForm = this.#formBuilder.group({
            prod_id: [detalle.prod_id],
            cantidad: [detalle.cantidad],
            prod_nom: [{ value: detalle.producto?.prod_nom ?? '', disabled: true }],
            prod_cod_interno: [{ value: detalle.producto?.prod_cod_interno ?? '', disabled: true }],
            unidad: [{ value: detalle.producto?.unidad?.uni_nom ?? '', disabled: true }],
            // If guía has cotización, prices are readonly; otherwise editable
            precio_unitario: [
              {
                value: hasCotizacion ? (detalle.precio_unitario ?? null) : null,
                disabled: hasCotizacion,
              },
            ],
            precio_venta: [{ value: null, disabled: hasCotizacion }],
            dscto: [{ value: 0, disabled: hasCotizacion }],
          });
          this.detailsArray.push(detailForm as any);
        });
      }

      // Disable product search control
      this.form.get('prod_id')?.disable();
      return;
    }

    const control = this.form.get(formControlName);
    if (control) {
      control.setValue(item[formControlName]);
    }

    if (formControlName === 'cli_id') {
      this.patchCustomer(item);
    }
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

    const detailForm = this.#formBuilder.group({
      prod_id: [this.selectedProduct.prod_id],
      cantidad: [1],
      prod_nom: [{ value: this.selectedProduct.prod_nom, disabled: true }],
      prod_cod_interno: [this.selectedProduct.prod_cod],
      unidad: [this.selectedProduct.unidad],
      precio_unitario: [{ value: this.selectedProduct.pventa ?? null }],
      precio_venta: [{ value: null, disabled: true }],
      dscto: [null],
    });

    this.detailsArray.push(detailForm as any);

    // Limpiar selección
    this.form.get('prod_id')?.setValue(null);
    this.selectedProduct = null;
  }

  onDetailRemoved(index: number) {
    console.log('Producto eliminado en índice:', index);
  }

  loadSelectCombos() {
    const currencies: SelectOption[] = [];
    const documents: SelectOption[] = [];
    const paymentType: SelectOption[] = [];
    const documentTypes: SelectOption[] = [];
    const sucursalOptions: SelectOption[] = [];
    const companyOptions: SelectOption[] = [];

    this.#currencyService.getAll().subscribe({
      next: (response) =>
        response.data.map((item) => {
          currencies.push({ value: item.mon_id, label: item.mon_nom });
        }),
    });

    this.#documentService.getAll().subscribe({
      next: (response) => {
        response.data.map((item) => {
          documents.push({ value: item.doc_id, label: item.doc_nom });
        });
      },
    });

    this.#documentTypeService.getAll().subscribe({
      next: (response) => {
        response.data.map((item) => {
          documentTypes.push({ value: item.tip_id, label: item.tip_nom });
        });
      },
    });

    this.#sucursalService.getAll().subscribe({
      next: (response) => {
        response.data.map((item) => {
          sucursalOptions.push({ value: item.suc_id, label: item.suc_nom });
        });
      },
    });

    this.#paymentMethod.getAll().subscribe({
      next: (response) => {
        response.data.map((item) => {
          paymentType.push({ value: item.mp_id, label: item.mp_nom });
        });
      },
    });

    this.#organizationService.getAll().subscribe({
      next: (response) => {
        response.data.map((item) => {
          companyOptions.push({ value: item.emp_id, label: item.emp_nom });
        });
      },
    });

    this.updateStructure(
      currencies,
      paymentType,
      documents,
      documentTypes,
      sucursalOptions,
      companyOptions,
      this.almacenOptions(),
    );
  }

  loadAlmacenesBySucursal(sucId: number) {
    this.#almacenService.getBySucursal(sucId).subscribe({
      next: (response) => {
        this.almacenOptions.set(mapToSelectOption(response.data, 'almacen_id', 'nombre'));
        this.form.patchValue({ almacen_id: null });
      },
    });
  }

  setupPaymentMethodListener() {
    this.form.get('mp_id')?.valueChanges.subscribe((mpId) => {
      const isCredito = mpId === 2;
      this.showFechaVencimiento.set(isCredito);

      const currencies: SelectOption[] = [];
      const documents: SelectOption[] = [];
      const paymentType: SelectOption[] = [];
      const documentTypes: SelectOption[] = [];
      const sucursalOptions: SelectOption[] = [];
      const companyOptions: SelectOption[] = [];

      // Reconstruir las opciones desde los valores actuales del structure
      const currentStructure = this.structure();
      currentStructure.forEach((section) => {
        section.controls.forEach((control) => {
          if (control.type === 'select' && 'options' in control) {
            switch (control.formControlName) {
              case 'mon_id':
                currencies.push(...control.options);
                break;
              case 'mp_id':
                paymentType.push(...control.options);
                break;
              case 'doc_id':
                documents.push(...control.options);
                break;
              case 'tip_id':
                documentTypes.push(...control.options);
                break;
              case 'suc_id':
                sucursalOptions.push(...control.options);
                break;
              case 'emp_id':
                companyOptions.push(...control.options);
                break;
            }
          }
        });
      });

      this.updateStructure(
        currencies,
        paymentType,
        documents,
        documentTypes,
        sucursalOptions,
        companyOptions,
        this.almacenOptions(),
      );
    });
  }

  updateStructure(
    currencies: SelectOption[],
    paymentType: SelectOption[],
    documents: SelectOption[],
    documentTypes: SelectOption[],
    sucursalOptions: SelectOption[],
    companyOptions: SelectOption[],
    almacenOptions: SelectOption[],
  ) {
    this.structure.set(
      saleStructure(
        currencies,
        paymentType,
        documents,
        documentTypes,
        sucursalOptions,
        companyOptions,
        almacenOptions,
        this.showFechaVencimiento(),
      ),
    );
  }

  save() {
    if (this.form.invalid || this.detailsArray.length === 0) {
      alert('Complete todos los campos requeridos y agregue al menos un producto');
      return;
    }

    const saleData = mapSaleCreateDto(this.form.getRawValue());

    this.#saleService.create(saleData).subscribe({
      next: (response) => {
        if (response.isValid) {
          this.#globalNotification.openAlert(response);
          this.cancel();
        } else {
          this.#globalNotification.openAlert(response);
        }
      },
      error: (error) => {
        console.error('Error completo:', error);
        this.#globalNotification.openToastAlert('Error', error.message, 'danger');
      },
    });
  }

  cancel() {
    this.form.reset();
    this.detailsArray.clear();
    this.selectedCotizacion.set(null);
    this.selectedGuia.set(null);
    this.isCotizacionAttached.set(false);
    this.isGuiaAttached.set(false);
    this.isGuiaWithCotizacion.set(false);
    // Re-enable product search
    this.form.get('prod_id')?.enable();
  }

  openCotizacionSearch() {
    /*
    this.searchDocumentModal.openModal('cotizacion', (doc) => {
      this.onSelectCotizacion(doc as QuotationModel);
    });
    */
  }

  onSelectCotizacion(cotizacion: QuotationModel) {
    this.selectedCotizacion.set(cotizacion);
    this.isCotizacionAttached.set(true);
    this.form.patchValue({ cot_id: cotizacion.cot_id });

    if (cotizacion.cliente) {
      this.form.patchValue({
        cli_id: cotizacion.cliente.cli_id,
        cli_documento: (cotizacion.cliente as any).cli_documento,
        tip_id: (cotizacion.cliente as any).tip_id,
        cli_direcc: (cotizacion.cliente as any).cli_direcc,
        cli_correo: (cotizacion.cliente as any).cli_correo,
        cli_telf: (cotizacion.cliente as any).cli_telf,
      });
    }

    if (cotizacion.detalles && cotizacion.detalles.length > 0) {
      this.detailsArray.clear();
      cotizacion.detalles.forEach((detalle: any) => {
        const detailForm = this.#formBuilder.group({
          prod_id: [detalle.prod_id],
          cantidad: [detalle.cantidad],
          prod_nom: [{ value: detalle.producto?.prod_nom ?? '', disabled: true }],
          prod_cod_interno: [{ value: detalle.producto?.prod_cod_interno ?? '', disabled: true }],
          unidad: [{ value: detalle.producto?.unidad?.uni_nom ?? '', disabled: true }],
          precio_unitario: [{ value: detalle.precio_unitario, disabled: true }],
          precio_venta: [{ value: null, disabled: true }],
          dscto: [{ value: detalle.descuento ?? 0, disabled: true }],
        });
        this.detailsArray.push(detailForm as any);
      });
    }

    this.form.get('prod_id')?.disable();
  }

  clearCotizacion() {
    this.selectedCotizacion.set(null);
    this.isCotizacionAttached.set(false);
    this.detailsArray.clear();
    this.form.get('prod_id')?.enable();
    this.form.patchValue({ cot_id: null });
    this.form.patchValue({
      cli_id: null,
      cli_documento: null,
      tip_id: null,
      cli_direcc: null,
      cli_correo: null,
      cli_telf: null,
    });
  }

  clearGuia() {
    this.selectedGuia.set(null);
    this.isGuiaAttached.set(false);
    this.isGuiaWithCotizacion.set(false);
    this.detailsArray.clear();
    this.form.get('prod_id')?.enable();
    this.form.patchValue({ guia_id: null });
  }
}

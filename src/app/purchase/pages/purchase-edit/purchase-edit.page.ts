import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  ButtonDirective,
  CardBodyComponent,
  CardComponent,
  ColComponent,
  ContainerComponent,
  RowComponent,
  TableDirective,
  SpinnerComponent,
} from '@coreui/angular';
import { IconDirective } from '@coreui/icons-angular';
import { SelectOption } from '@shared/types';
import { TypedFormGroup } from '@shared/types/types-form';
import { SearchSelectComponent } from '@shared/components/search-select.component';
import { PurchaseDetailTableComponent } from 'src/app/purchase-detail/components/purchase-detail-table.component';
import { PurchaseDetailForm } from 'src/app/purchase-detail/core/types';
import { buildPurchaseDetailForm } from 'src/app/purchase-detail/helpers';
import { GlobalNotification } from '@shared/alerts/global-notification/global-notification';
import { mapToSelectOption, parseLocalDate } from '@shared/functions';
import { CurrencyPipe } from '@shared/pipes/currency.pipe';
import { PurchaseService } from '../../core/services/purchase.service';
import { buildPurchaseForm } from '../../helpers/build-purchase-form';
import { purchaseStructure } from '../../helpers';
import { CurrencyService } from 'src/app/currency/core/services/currency.service';
import { SupplierService } from 'src/app/supplier/core/services/supplier.service';
import { ProductService } from 'src/app/products/core/services/product.service';
import { DocumentTypeService } from 'src/app/document-type/core/services/document-type.service';
import { PaymentMethodService } from 'src/app/payment-method/core/services/payment-method.service';
import { AlmacenService } from 'src/app/almacen/core/services/almacen.service';
import { BancoService } from 'src/app/banco/core/services/banco.service';
import { forkJoin } from 'rxjs';
import { PurchaseModel, PurchasePaymentModel } from '../../core/models/purchase.model';

const PAYMENT_METHOD_OPTIONS: SelectOption[] = [
  { value: 'EFECTIVO', label: 'Efectivo' },
  { value: 'TRANSFERENCIA', label: 'Transferencia' },
  { value: 'CHEQUE', label: 'Cheque' },
  { value: 'DEPÓSITO', label: 'Depósito' },
];

@Component({
  selector: 'app-purchase-edit',
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
    SpinnerComponent,
    DatePipe,
    CurrencyPipe,
  ],
  templateUrl: './purchase-edit.page.html',
})
export class PurchaseEditPage implements OnInit {
  public purchaseId!: number;
  public purchase = signal<PurchaseModel | null>(null);
  public payments = signal<PurchasePaymentModel[]>([]);
  public isLoading = signal(true);
  public isSaving = signal(false);
  public isRegisteringPayment = signal(false);

  public form!: FormGroup;
  public paymentForm!: FormGroup;
  public selectedProduct: any = null;
  public supplierLabel = signal<string>('');
  public almacenOptions = signal<SelectOption[]>([]);
  public bancoOptions = signal<SelectOption[]>([]);

  public structure = signal(purchaseStructure());

  readonly #formBuilder = inject(FormBuilder);
  readonly #purchaseService = inject(PurchaseService);
  readonly #currencyService = inject(CurrencyService);
  readonly #supplierService = inject(SupplierService);
  readonly #paymentMethodService = inject(PaymentMethodService);
  readonly #productService = inject(ProductService);
  readonly #documentTypeService = inject(DocumentTypeService);
  readonly #almacenService = inject(AlmacenService);
  readonly #bancoService = inject(BancoService);
  readonly #globalNotification = inject(GlobalNotification);
  readonly #route = inject(ActivatedRoute);
  readonly #router = inject(Router);

  paymentMethodOptions = PAYMENT_METHOD_OPTIONS;

  serviceMap: Record<string, any> = {
    providerSearch: (term: string) => this.#supplierService.searchQuick(term),
    productSearch: (term: string) =>
      this.#productService.searchQuick({
        term,
        almacen_id: this.form.get('almacen_id')?.value,
      }),
  };

  get detailsArray(): FormArray<TypedFormGroup<PurchaseDetailForm>> {
    return this.form.get('detalles') as FormArray<TypedFormGroup<PurchaseDetailForm>>;
  }

  /**
   * Solo Pendiente (crédito, sin pagos todavía) permite editar los datos de la compra —
   * mismo criterio que ActualizarCompraUseCase en el backend. Completado/Anulado/En Pago
   * bloquean, En Pago porque ya hay al menos un pago parcial registrado.
   */
  get isEditable(): boolean {
    return this.purchase()?.stateCode === '01';
  }

  get canRegisterPayment(): boolean {
    const p = this.purchase();
    if (!p) return false;
    return p.stateCode !== '02' && p.stateCode !== '03' && p.amountPending > 0;
  }

  ngOnInit(): void {
    this.purchaseId = Number(this.#route.snapshot.params['id']);
    this.form = this.#formBuilder.group(buildPurchaseForm());
    this.paymentForm = this.#buildPaymentForm();

    this.paymentForm.get('metodo')?.valueChanges.subscribe((metodo) => {
      const bancoControl = this.paymentForm.get('banco_id');
      if (metodo === 'EFECTIVO') {
        bancoControl?.clearValidators();
        bancoControl?.setValue(null);
      } else {
        bancoControl?.setValidators([Validators.required]);
      }
      bancoControl?.updateValueAndValidity();
    });

    forkJoin({
      currencies: this.#currencyService.getAll(),
      paymentMethods: this.#paymentMethodService.getAll(),
      documentTypes: this.#documentTypeService.getAll(),
      bancos: this.#bancoService.getAll(),
    }).subscribe(({ currencies, paymentMethods, documentTypes, bancos }) => {
      this.structure.set(purchaseStructure(currencies.data, paymentMethods.data, documentTypes.data));
      this.bancoOptions.set(mapToSelectOption(bancos.data, 'id', 'name'));
    });

    this.loadPurchase();
  }

  loadPurchase(): void {
    this.isLoading.set(true);
    this.#purchaseService.get(this.purchaseId).subscribe({
      next: (response) => {
        this.isLoading.set(false);
        if (!response.isValid) {
          this.#globalNotification.openAlert(response);
          return;
        }
        this.purchase.set(response.data);
        this.patchForm(response.data);
        this.loadPayments();
        if (!this.isEditable) {
          this.form.disable();
        }
      },
      error: () => {
        this.isLoading.set(false);
        this.#globalNotification.openToastAlert('Error', 'No se pudo cargar la compra', 'danger');
      },
    });
  }

  loadPayments(): void {
    this.#purchaseService.getPayments(this.purchaseId).subscribe({
      next: (response) => {
        if (response.isValid) {
          this.payments.set(response.data);
        }
      },
    });
  }

  private patchForm(purchase: PurchaseModel): void {
    this.detailsArray.clear();
    purchase.details.forEach((detail) => {
      const detailForm = buildPurchaseDetailForm({
        prod_id: detail.productId,
        cantidad: detail.quantity,
        prod_nom: detail.productName,
        prod_cod_interno: detail.productCode,
        unidad: detail.productUnit,
        costo_unitario: detail.unitCost,
        precio_compra: detail.unitCost,
        dscto: 0,
        precio_unitario: detail.unitCost,
      });
      this.detailsArray.push(detailForm as any);
    });

    this.form.patchValue({
      suc_id: purchase.branchId,
      doc_id: purchase.documentId,
      mp_cod: purchase.paymentMethodId,
      mon_id: purchase.currencyId,
      fechaEmision: parseLocalDate(purchase.issueDate),
      numero: purchase.number,
      prov_id: purchase.supplierId,
      prov_documento: purchase.supplier?.document ?? null,
      prov_direcc: purchase.supplier?.address ?? null,
      prov_correo: purchase.supplier?.email ?? null,
      prov_telf: purchase.supplier?.phone ?? null,
      compr_coment: purchase.notes,
      afecta_stock: purchase.affectsStock,
    });

    this.supplierLabel.set(purchase.supplier?.name ?? '');

    if (purchase.branchId) {
      this.#almacenService.getBySucursal(purchase.branchId).subscribe({
        next: (response) => {
          this.almacenOptions.set(mapToSelectOption(response.data, 'id', 'nombre'));
        },
      });
    }
  }

  onSelectItem(formControlName: string, item: any) {
    if (!item) return;

    if (formControlName === 'prod_id') {
      this.form.patchValue({ prod_id: item.id });
      this.selectedProduct = item;
      return;
    }

    if (formControlName === 'prov_id') {
      this.form.patchValue({
        prov_id: item.id,
        prov_documento: item.document,
        tip_id: item.documentTypeId,
        prov_direcc: item.address,
        prov_correo: item.email,
        prov_telf: item.phone,
      });
      this.supplierLabel.set(item.name);
      return;
    }
  }

  addProductToDetail() {
    if (!this.selectedProduct) return;

    const exists = this.detailsArray.controls.some(
      (control) => control.value.prod_id === this.selectedProduct.id,
    );
    if (exists) {
      this.#globalNotification.openToastAlert('Aviso', 'Este producto ya ha sido agregado', 'warning');
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
  }

  onDetailRemoved(_index: number): void {}

  save(): void {
    if (!this.isEditable || this.form.invalid || this.detailsArray.length === 0) {
      return;
    }

    this.isSaving.set(true);

    const raw = this.form.getRawValue();
    const body = {
      id: this.purchaseId,
      idProveedor: raw.prov_id,
      idMoneda: raw.mon_id,
      idMetodoPago: raw.mp_cod ? Number(raw.mp_cod) : null,
      idDocumento: raw.doc_id,
      fechaEmision: raw.fechaEmision,
      numero: raw.numero,
      afectaStock: raw.afecta_stock,
      comentario: raw.compr_coment,
      detalles: this.detailsArray.getRawValue().map((v) => ({
        idProducto: v.prod_id,
        cantidad: v.cantidad,
        precioCompra: v.precio_compra,
        descuento: v.dscto ?? 0,
      })),
    };

    this.#purchaseService.update(body).subscribe({
      next: (response) => {
        this.isSaving.set(false);
        this.#globalNotification.openAlert(response);
        if (response.isValid) {
          this.#router.navigate(['/compras'], { queryParams: { tab: 'history' } });
        }
      },
      error: (error) => {
        this.isSaving.set(false);
        this.#globalNotification.openToastAlert('Error', error.messages ?? 'No se pudo actualizar', 'danger');
      },
    });
  }

  registerPayment(): void {
    if (this.paymentForm.invalid || !this.canRegisterPayment) {
      this.paymentForm.markAllAsTouched();
      return;
    }

    const value = this.paymentForm.getRawValue();
    if (value.monto > (this.purchase()?.amountPending ?? 0)) {
      this.#globalNotification.openToastAlert(
        'Validación',
        'El monto no puede exceder el saldo pendiente',
        'warning',
      );
      return;
    }

    this.isRegisteringPayment.set(true);
    this.#purchaseService
      .registerPayment(this.purchaseId, {
        monto: value.monto,
        metodo: value.metodo,
        banco_id: value.banco_id,
        referencia_externa: value.referencia_externa,
        observacion: value.observacion,
      })
      .subscribe({
        next: (response) => {
          this.isRegisteringPayment.set(false);
          this.#globalNotification.openAlert(response);
          if (response.isValid) {
            this.paymentForm.reset();
            this.loadPurchase();
          }
        },
        error: (error) => {
          this.isRegisteringPayment.set(false);
          this.#globalNotification.openToastAlert('Error', error.messages ?? 'No se pudo registrar el pago', 'danger');
        },
      });
  }

  goBack(): void {
    this.#router.navigate(['/compras'], { queryParams: { tab: 'history' } });
  }

  #buildPaymentForm(): FormGroup {
    return this.#formBuilder.group({
      monto: this.#formBuilder.control<number | null>(null, [Validators.required, Validators.min(0.01)]),
      metodo: this.#formBuilder.control<string | null>('EFECTIVO', [Validators.required]),
      banco_id: this.#formBuilder.control<number | null>(null),
      referencia_externa: this.#formBuilder.control<string | null>(null),
      observacion: this.#formBuilder.control<string | null>(null),
    });
  }
}

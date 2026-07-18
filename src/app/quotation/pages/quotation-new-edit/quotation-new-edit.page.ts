import { Component, inject, Inject, OnInit, signal, ViewContainerRef } from '@angular/core';
import { FormArray, FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import {
  ButtonDirective,
  CardBodyComponent,
  CardComponent,
  ColComponent,
  ContainerComponent,
  RowComponent,
} from '@coreui/angular';
import { IconDirective } from '@coreui/icons-angular';
import { MODULES } from 'src/app/core/config/permissions/modules';
import { GlobalNotification } from '@shared/alerts/global-notification/global-notification';
import { QuotationService } from '../../core/services/quotation.service';
import { BaseComponent } from '@shared/base/base.component';
import { quotationStructure } from '../../helpers/quotation-structure';
import { buildQuotationForm } from '../../helpers/build-quotation-form';
import { buildQuotationDetailForm } from '../../helpers/build-quotation-detail-form';
import { SelectOption } from '@shared/types';
import { SearchSelectComponent } from '@shared/components/search-select.component';
import { CustomerService } from 'src/app/customer/core/services/customer.service';
import { ProductService } from 'src/app/products/core/services/product.service';
import { SucursalService } from 'src/app/sucursal/core/services/sucursal.service';
import { CurrencyService } from 'src/app/currency/core/services/currency.service';
import { QuotationDetailTableComponent } from '../../components/quotation-detail-table.component';
import { QuotationCreateDto } from '../../core/types/quotation-create-dto';
import { messages } from '../../helpers';
import { ValidationMessagesComponent } from '@shared/components/error-messages/validation-messages.component';
import { QuotationDetailCreateDto, QuotationForm } from '../../core/types';
import { TypedFormGroup } from '@shared/types/types-form';
import { PaymentMethodService } from 'src/app/payment-method/core/services/payment-method.service';
import { UserService } from 'src/app/user/core/services/user.service';
import { AuthService } from 'src/app/core/auth/services/auth.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-quotation-new-edit',
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
    QuotationDetailTableComponent,
    ValidationMessagesComponent,
  ],
  templateUrl: './quotation-new-edit.page.html',
  styles: `
    .gap-2 {
      gap: 0.5rem;
    }
  `,
})
export class QuotationNewEditPage extends BaseComponent implements OnInit {
  structure = signal(quotationStructure());
  form!: TypedFormGroup<QuotationForm>;
  selectedProduct: any = null;
  quotaId = signal<number | null>(null);
  searchSelectLabels: Record<string, string> = {};
  errorMessages = messages;
  almacenOptions: SelectOption[] = [];
  sucursalError = signal(false);
  vendedorOptions: SelectOption[] = [];
  readonly #formBuilder = inject(FormBuilder);
  readonly #paymentMethodService = inject(PaymentMethodService);
  readonly #quotationService = inject(QuotationService);
  readonly #customerService = inject(CustomerService);
  readonly #productService = inject(ProductService);
  readonly #sucursalService = inject(SucursalService);
  readonly #currencyService = inject(CurrencyService);
  readonly #globalNotification = inject(GlobalNotification);
  readonly #route = inject(ActivatedRoute);
  readonly #router = inject(Router);
  readonly #userService = inject(UserService);
  readonly #authService = inject(AuthService);

  constructor(@Inject(ViewContainerRef) viewContainerRef: ViewContainerRef) {
    super(MODULES.SALES, viewContainerRef);
  }

  ngOnInit() {
    this.form = this.#formBuilder.group(buildQuotationForm());
    this.loadSelectCombos();
    this.checkEditMode();
  }

  checkEditMode() {
    const id = this.#route.snapshot.params['id'];
    if (id) {
      this.quotaId.set(Number(id));
      this.loadQuotation(this.quotaId()!);
    }
  }

  loadQuotation(id: number) {
    this.#quotationService.getById(id).subscribe({
      next: (response) => {
        if (response.isValid && response.data) {
          const data = response.data;

          // Formatear fechas para input type="date" (YYYY-MM-DD)
          const fechaEmision = data.fecha_emision ? data.fecha_emision.substring(0, 10) : '';
          const fechaValido = data.fecha_valido_hasta ? data.fecha_valido_hasta.substring(0, 10) : '';

          const { detalles, ...rest } = data;

          this.form.patchValue({
            ...rest,
            fecha_emision: fechaEmision,
            fecha_valido_hasta: fechaValido,
          });

          // Labels para search-select
          if (data.cliente) {
            this.searchSelectLabels['cli_id'] = data.cliente.businessName;
          }

          this.patchCustomer(data.cliente);


          // Cargar detalles
          this.detailsArray.clear();
          data.detalles.forEach((det: any) => {
            this.detailsArray.push(this.#formBuilder.group(buildQuotationDetailForm({
              prod_id: det.prod_id,
              cantidad: det.cantidad,
              prod_nom: det.producto?.prod_nom || det.descripcion,
              prod_cod: det.producto?.prod_cod_interno || '',
              unidad: det.producto?.unidad.und_nom || '',
              precio_unitario: det.precio_unitario,
              dscto: det.descuento || 0,
              precio_total: (det.cantidad * det.precio_unitario) - (det.descuento || 0)
            })));
          });
        }
      }
    });
  }

  get detailsArray(): FormArray {
    return this.form.get('detalles') as FormArray;
  }

  serviceMap: Record<string, any> = {
    customerSearch: (term: string) => this.#customerService.getAll(),
    productSearch: (term: string) => {
      // Use searchAll for cotizaciones - no warehouse/stock required
      return this.#productService.searchAll(term);
    },
  };

  onProductSearchFocus() {
    // No longer needed - cotizaciones don't require warehouse
    this.sucursalError.set(false);
  }

  onSelectChange(controlName: string | undefined, event: Event) {
    if (!controlName) return;

    const value = (event.target as HTMLSelectElement).value;

    if (controlName === 'suc_id' && value) {
      this.form.patchValue({ suc_id: Number.parseInt(value) });
      this.selectedProduct = null;
    }
  }

  // Removed loadAlmacenesBySucursal - cotizaciones don't use warehouses

  patchCustomer(item: any) {
    this.form.patchValue({
      cli_documento: item.cli_documento,
      tip_id: item.tip_id,
      cli_direcc: item.cli_direcc,
      correo_contacto: item.cli_correo,
      telefono_contacto: item.cli_telf,
    });
  }

  onSelectItem(formControlName: string | undefined, item: any) {
    if (!formControlName) return;

    if (formControlName === 'prod_id') {
      this.form.patchValue({
        prod_id: item.prod_id,
      });
      this.selectedProduct = item;
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

    const exists = this.detailsArray.controls.some(
      (control) => control.value.prod_id === this.selectedProduct.prod_id
    );

    if (exists) {
      alert('Este producto ya ha sido agregado');
      return;
    }

    const detailForm = this.#formBuilder.group(
      buildQuotationDetailForm({
        prod_id: this.selectedProduct.prod_id,
        cantidad: 1,
        prod_nom: this.selectedProduct.prod_nom,
        prod_cod: this.selectedProduct.prod_cod,
        unidad: this.selectedProduct.unidad || '',
        precio_unitario: this.selectedProduct.pventa || 0,
        dscto: 0,
        precio_total: null,
      })
    );

    this.detailsArray.push(detailForm);

    this.form.get('prod_id')?.setValue(null);
    this.selectedProduct = null;
  }

  onDetailRemoved(index: number) {
    // La eliminación ya se hace en el componente de tabla por simplicidad, 
    // pero si quisiéramos hacer algo más aquí lo podríamos hacer.
    console.log('Producto eliminado en índice:', index);
  }

  loadSelectCombos() {
    forkJoin({
      currencies: this.#currencyService.getAll(),
      sucursal: this.#sucursalService.getAll(),
      paymentMethods: this.#paymentMethodService.getAll(),
      vendedores: this.#userService.getAll()
    }).subscribe(({ currencies, sucursal, paymentMethods, vendedores }) => {
      this.structure.set(quotationStructure(currencies.data, sucursal.data, paymentMethods.data, vendedores.data));
    })
    const currentUserId = this.#authService.user()?.id;
    if (currentUserId) {
      this.form.patchValue({ usu_id: currentUserId });
    }

  }

  save() {
    if (this.form.invalid || this.detailsArray.length === 0) {
      this.#globalNotification.openToastAlert('Validación', 'Complete todos los campos requeridos');
      this.form.markAllAsTouched();
      const invalidControls: { campo: string; errores: any }[] = [];
      const controls = this.form.controls;
      Object.keys(controls).forEach((name) => {
        const control = controls[name as keyof typeof controls];
        if (control.invalid) {
          invalidControls.push({
            campo: name,
            errores: control.errors
          });
        }
      });
      console.table(invalidControls); // Esto te dará una tabla clara en la consola
      return;
    }

    const quotationData: QuotationCreateDto = {
      ...(this.form.getRawValue() as any),
      detalles: this.detailsArray.getRawValue().map((v) => {
        return {
          prod_id: v.prod_id,
          cantidad: v.cantidad,
          precio_unitario: v.precio_unitario,
          descripcion: v.prod_nom,
          descuento: v.dscto || 0,
        } as QuotationDetailCreateDto;
      }),
    };

    const request = this.quotaId()
      ? this.#quotationService.update(this.quotaId()!, quotationData)
      : this.#quotationService.create(quotationData);

    request.subscribe({
      next: (response) => {
        if (response.isValid) {
          this.#globalNotification.openAlert(response);
          this.#router.navigate(['/historial-cotizaciones']);
        } else {
          this.#globalNotification.openAlert(response);
        }
      },
      error: (error) => {
        this.#globalNotification.openToastAlert('Error', error.message, 'danger');
      },
    });
  }

  cancel() {
    this.form.reset();
    this.detailsArray.clear();
  }
}

import { Component, inject, Inject, OnInit, signal, ViewContainerRef } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import {
  ButtonDirective,
  CardBodyComponent,
  CardComponent,
  ColComponent,
  ContainerComponent,
  RowComponent,
  SpinnerComponent,
  TableDirective,
  FormCheckComponent,
  FormCheckInputDirective,
  FormCheckLabelDirective,
  FormSelectDirective,
  TextColorDirective,
} from '@coreui/angular';
import { IconDirective } from '@coreui/icons-angular';
import { BaseComponent } from '../../../shared/base/base.component';
import { MODULES } from '../../../core/config/permissions/modules';
import { GlobalNotification } from '@shared/alerts/global-notification/global-notification';
import { ValidationMessagesComponent } from '@shared/components/error-messages/validation-messages.component';
import { SearchSelectComponent } from '@shared/components/search-select.component';
import { DateRangePickerComponent } from '@shared/components/date-range-picker/date-range-picker.component';
import { QuotationService } from '../../core/services/quotation.service';
import { QuotationModel } from '../../core/models/quotation.model';
import { PageParamsModel } from '@shared/models/query/page-params.model';
import { PaginatorComponent } from 'src/app/shared/components/paginator/paginator.component';
import { ConfirmService } from '@shared/confirm-modal/core/services/confirm-modal.service';
import { buildFilterForm, filterSort, mapParams, messages } from '../../helpers';
import { quotationStructure } from '../../helpers/quotation-structure';
import { buildQuotationForm } from '../../helpers/build-quotation-form';
import { buildQuotationDetailForm } from '../../helpers/build-quotation-detail-form';
import { QuotationDetailTableComponent } from '../../components/quotation-detail-table.component';
import { QuotationCreateDto, QuotationDetailCreateDto, QuotationForm } from '../../core/types';
import { TypedFormGroup } from '@shared/types/types-form';
import { CustomerService } from 'src/app/customer/core/services/customer.service';
import { ProductService } from 'src/app/products/core/services/product.service';
import { SucursalService } from 'src/app/sucursal/core/services/sucursal.service';
import { CurrencyService } from 'src/app/currency/core/services/currency.service';
import { PaymentMethodService } from 'src/app/payment-method/core/services/payment-method.service';
import { Sucursal } from 'src/app/sucursal/core/models';
import { ActivatedRoute } from '@angular/router';
import { forkJoin } from 'rxjs';
import { UserService } from 'src/app/user/core/services/user.service';
import { AuthService } from 'src/app/core/auth/services/auth.service';

@Component({
  selector: 'app-quotation-main',
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
    DateRangePickerComponent,
    QuotationDetailTableComponent,
    ValidationMessagesComponent,
    SpinnerComponent,
    TableDirective,
    PaginatorComponent,
    FormCheckComponent,
    FormCheckInputDirective,
    FormCheckLabelDirective,
    FormSelectDirective,
    TextColorDirective,
    DatePipe,
    CurrencyPipe,
  ],
  templateUrl: './quotation-main.page.html',
})
export class QuotationMainPage extends BaseComponent implements OnInit {
  public activeTab = signal<'create' | 'history'>('create');

  public isLoadingList = signal(false);
  public quotations: QuotationModel[] = [];
  public totalList = 0;
  public pageList = new PageParamsModel(1, 10);

  public isLoadingForm = signal(false);
  public form!: TypedFormGroup<QuotationForm>;
  public selectedProduct: any = null;
  public quotaId = signal<number | null>(null);
  public searchSelectLabels: Record<string, string> = {};
  public errorMessages = messages;
  public structure = signal(quotationStructure());

  public sucursales: Sucursal[] = [];

  /**
   * Colores por codigo: decision de UI, el catalogo de EstadoCotizacion no
   * tiene ese campo. codigo/nombre vienen de verdad de getEstados().
   */
  private readonly stateColorByCode: Record<string, string> = {
    '01': 'warning',
    '02': 'success',
    '03': 'danger',
    '04': 'info',
  };

  availableStates: { codigo: string; nombre: string; color: string }[] = [];

  readonly #formBuilder = inject(FormBuilder);
  readonly #paymentMethodService = inject(PaymentMethodService);
  readonly #quotationService = inject(QuotationService);
  readonly #userService = inject(UserService);
  readonly #customerService = inject(CustomerService);
  readonly #productService = inject(ProductService);
  readonly #sucursalService = inject(SucursalService);
  readonly #currencyService = inject(CurrencyService);
  readonly #globalNotification = inject(GlobalNotification);
  readonly #route = inject(ActivatedRoute);
  readonly #confirmService = inject(ConfirmService);
  readonly #authService = inject(AuthService);

  constructor(@Inject(ViewContainerRef) viewContainerRef: ViewContainerRef) {
    super(MODULES.SALES, viewContainerRef);
  }

  ngOnInit(): void {
    this.formList = this.#formBuilder.group(buildFilterForm());

    const id = this.#route.snapshot.params['id'];
    if (id) {
      this.quotaId.set(Number(id));
      this.activeTab.set('create');
    }

    this.loadForm();
    this.loadListData();
    this.loadSelectCombos();
  }

  loadForm() {
    this.form = this.#formBuilder.group(buildQuotationForm());
    const currentUserId = this.#authService.user()?.id;
    if (currentUserId) {
      this.form.patchValue({ usu_id: currentUserId });
    }

    if (this.quotaId()) {
      this.loadQuotation(this.quotaId()!);
    }
  }

  loadListData() {
    this.loadSucursales();
    this.loadEstados();
    this.onSearch();
  }

  loadEstados() {
    this.#quotationService.getEstados().subscribe({
      next: (response) => {
        if (response.isValid) {
          this.availableStates = response.data.map((estado) => ({
            codigo: estado.codigo,
            nombre: estado.nombre,
            color: this.stateColorByCode[estado.codigo] ?? 'secondary',
          }));
        }
      },
    });
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

  loadQuotation(id: number) {
    this.isLoadingForm.set(true);
    this.#quotationService.getById(id).subscribe({
      next: (response) => {
        this.isLoadingForm.set(false);
        if (response.isValid && response.data) {
          const data = response.data;

          const fechaEmision = data.issueDate ? data.issueDate.substring(0, 10) : '';
          const fechaValido = data.validUntilDate ? data.validUntilDate.substring(0, 10) : '';

          this.form.patchValue({
            numero: data.number,
            numero_completo: data.fullNumber,
            fecha_emision: fechaEmision,
            fecha_valido_hasta: fechaValido,
            mostrar_fecha_valido_hasta: data.showValidUntilDate,
            emp_id: data.companyId,
            suc_id: data.branchId,
            cli_id: data.customerId,
            nombre_contacto: data.contactName,
            telefono_contacto: data.contactPhone,
            correo_contacto: data.contactEmail,
            area_contacto: data.contactArea,
            mon_id: data.currencyId,
            mostrar_moneda: data.showCurrency,
            cot_subtotal: data.subtotal,
            cot_igv: data.tax,
            igv_requerido: data.taxRequired,
            cot_total: data.total,
            mostrar_total: data.showTotal,
            cot_descuento: data.discount,
            observaciones: data.notes,
            mostrar_observaciones: data.showNotes,
            condiciones_pago: data.paymentTerms,
            mostrar_condiciones_pago: data.showPaymentTerms,
            tipo_pago_id: data.paymentMethodId,
            mostrar_tipo_pago: data.showPaymentMethod,
            forma_pago: data.paymentForm,
            mostrar_forma_pago: data.showPaymentForm,
            plazo_entrega: data.deliveryTime,
            mostrar_plazo_entrega: data.showDeliveryTime,
            lugar_entrega: data.deliveryPlace,
            mostrar_lugar_entrega: data.showDeliveryPlace,
            garantia: data.warranty,
            mostrar_garantia: data.showWarranty,
            consideraciones: data.considerations,
            mostrar_consideraciones: data.showConsiderations,
            servicio_complementario: data.complementaryService,
            mostrar_servicio_complementario: data.showComplementaryService,
            usu_id: data.userId,
          });

          if (data.customer) {
            this.searchSelectLabels['cli_id'] = data.customer.name;
          }

          this.patchCustomer(data.customer);

          this.detailsArray.clear();
          data.details.forEach((det) => {
            this.detailsArray.push(
              this.#formBuilder.group(
                buildQuotationDetailForm({
                  prod_id: det.productId,
                  cantidad: det.quantity,
                  prod_nom: det.productName || det.description || '',
                  prod_cod: det.productCode || '',
                  unidad: det.productUnit || '',
                  precio_unitario: det.unitPrice,
                  dscto: det.discount || 0,
                  precio_total: det.quantity * det.unitPrice - (det.discount || 0),
                }),
              ),
            );
          });
        }
      },
      error: () => {
        this.isLoadingForm.set(false);
      },
    });
  }

  get detailsArray(): FormArray {
    return this.form.get('detalles') as FormArray;
  }

  serviceMap: Record<string, any> = {
    customerSearch: (term: string) => this.#customerService.searchQuick(term),
    productSearch: (term: string) =>
      this.#productService.searchQuick({
        term,
        suc_id: this.form.value.suc_id!,
      }),
  };

  patchCustomer(item: any) {
    this.form.patchValue({
      cli_documento: item.document,
      tip_id: item.documentTypeId,
      cli_direcc: item.address,
      correo_contacto: item.email,
      telefono_contacto: item.phone,
    });
  }

  onSelectItem(formControlName: string | undefined, item: any) {
    if (!formControlName) return;

    if (formControlName === 'prod_id') {
      this.form.patchValue({
        prod_id: item.id,
      });
      this.selectedProduct = item;
      return;
    }

    if (formControlName === 'cli_id') {
      this.form.patchValue({ cli_id: item.id });
      this.patchCustomer(item);
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

    const detailForm = this.#formBuilder.group(
      buildQuotationDetailForm({
        prod_id: this.selectedProduct.id,
        cantidad: 1,
        prod_nom: this.selectedProduct.nombre,
        prod_cod: this.selectedProduct.codigo,
        unidad: this.selectedProduct.unidad || '',
        precio_unitario: this.selectedProduct.pventa || 0,
        dscto: 0,
        precio_total: null,
      }),
    );

    this.detailsArray.push(detailForm);

    this.form.get('prod_id')?.setValue(null);
    this.selectedProduct = null;
  }

  onDetailRemoved(index: number) {
    console.log('Producto eliminado en índice:', index);
  }

  loadSelectCombos() {
    forkJoin({
      currencies: this.#currencyService.getAll(),
      sucursal: this.#sucursalService.getAll(),
      paymentMethods: this.#paymentMethodService.getAll(),
      vendedores: this.#userService.getAll(),
    }).subscribe(({ currencies, sucursal, paymentMethods, vendedores }) => {
      this.structure.set(
        quotationStructure(currencies.data, sucursal.data, paymentMethods.data, vendedores.data),
      );
    });
  }

  save() {
    if (this.form.invalid || this.detailsArray.length === 0) {
      this.#globalNotification.openToastAlert('Validación', 'Complete todos los campos requeridos');
      this.form.markAllAsTouched();
      return;
    }

    this.isLoadingForm.set(true);

    const raw = this.form.getRawValue();

    const quotationData: QuotationCreateDto = {
      ...(this.quotaId() ? { id: this.quotaId()! } : {}),
      idSucursal: raw.suc_id!,
      idUsuario: raw.usu_id!,
      idCliente: raw.cli_id,
      idMoneda: raw.mon_id,
      idSerie: raw.serie_id,
      fechaEmision: raw.fecha_emision,
      fechaValidoHasta: raw.fecha_valido_hasta,
      nombreContacto: raw.nombre_contacto,
      telefonoContacto: raw.telefono_contacto,
      correoContacto: raw.correo_contacto,
      areaContacto: raw.area_contacto,
      descuento: raw.cot_descuento || 0,
      igvRequerido: raw.igv_requerido ?? true,
      mostrarFechaValidoHasta: raw.mostrar_fecha_valido_hasta ?? false,
      mostrarMoneda: raw.mostrar_moneda ?? true,
      mostrarTotal: raw.mostrar_total ?? true,
      mostrarObservaciones: raw.mostrar_observaciones ?? false,
      mostrarCondicionesPago: raw.mostrar_condiciones_pago ?? false,
      mostrarTipoPago: raw.mostrar_tipo_pago ?? false,
      mostrarFormaPago: raw.mostrar_forma_pago ?? false,
      mostrarPlazoEntrega: raw.mostrar_plazo_entrega ?? false,
      mostrarLugarEntrega: raw.mostrar_lugar_entrega ?? false,
      mostrarGarantia: raw.mostrar_garantia ?? false,
      mostrarConsideraciones: raw.mostrar_consideraciones ?? false,
      mostrarServicioComplementario: raw.mostrar_servicio_complementario ?? false,
      detalles: this.detailsArray.getRawValue().map((v) => {
        return {
          idProducto: v.prod_id,
          cantidad: v.cantidad,
          precioUnitario: v.precio_unitario,
          descuento: v.dscto || 0,
        } as QuotationDetailCreateDto;
      }),
    };

    const request = this.quotaId()
      ? this.#quotationService.update(this.quotaId()!, quotationData)
      : this.#quotationService.create(quotationData);

    request.subscribe({
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
      error: (error) => {
        this.isLoadingForm.set(false);
        this.#globalNotification.openToastAlert('Error', error.message, 'danger');
      },
    });
  }

  resetForm() {
    this.form.reset();
    this.detailsArray.clear();
    this.quotaId.set(null);
    this.selectedProduct = null;
    this.searchSelectLabels = {};
    this.form = this.#formBuilder.group(buildQuotationForm());
  }

  toggleEstado(codigo: string) {
    const currentEstados = this.formList?.get('estados')?.value || [];
    const index = currentEstados.indexOf(codigo);
    if (index > -1) {
      currentEstados.splice(index, 1);
    } else {
      currentEstados.push(codigo);
    }
    this.formList?.get('estados')?.setValue([...currentEstados]);
  }

  isEstadoChecked(codigo: string): boolean {
    return (this.formList?.get('estados')?.value || []).includes(codigo);
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
    this.#quotationService.search(params).subscribe({
      next: (response) => {
        this.isLoadingList.set(false);
        if (response.isValid) {
          this.totalList = response.data.total;
          this.quotations = response.data.items;
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
    if (this.formList) {
      this.formList.reset();
      this.formList.patchValue({
        order: 'desc',
        estados: ['02'],
        suc_id: null,
      });
    }
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
              this.#globalNotification.openToastAlert('Error', error.messages, 'danger');
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
        this.#globalNotification.openToastAlert('Error', error.message, 'danger');
      },
    });
  }

  onEdit(id: number) {
    this.activeTab.set('create');
    this.quotaId.set(id);
    this.loadQuotation(id);
  }

  onClone(id: number) {
    this.#quotationService.clone(id).subscribe({
      next: (response) => {
        this.#globalNotification.openAlert(response);
        if (response.isValid) {
          this.onSearch();
        }
      },
      error: (error) => {
        this.#globalNotification.openToastAlert('Error', error.message, 'danger');
      },
    });
  }

  stateColor(code: string | null): string {
    return this.availableStates.find((state) => state.codigo === code)?.color ?? 'secondary';
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
      fecha_desde: range.start ? formatDateForApi(range.start) : null,
      fecha_hasta: range.end ? formatDateForApi(range.end) : null,
    });
  }
}

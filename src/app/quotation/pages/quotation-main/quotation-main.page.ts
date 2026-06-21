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
import { PaginatorComponent } from 'src/app/paginator/paginator.component';
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
import { GetSucursalModel } from 'src/app/sucursal/core/models';
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

  public sucursales: GetSucursalModel[] = [];

  availableStates = [
    { codigo: '01', nombre: 'Pendientes', color: 'warning' },
    { codigo: '02', nombre: 'Facturados', color: 'success' },
    { codigo: '03', nombre: 'Anulados', color: 'danger' },
    { codigo: '04', nombre: 'En Proceso', color: 'info' },
  ];

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

  loadQuotation(id: number) {
    this.isLoadingForm.set(true);
    this.#quotationService.getById(id).subscribe({
      next: (response) => {
        this.isLoadingForm.set(false);
        if (response.isValid && response.data) {
          const data = response.data;

          const fechaEmision = data.fecha_emision ? data.fecha_emision.substring(0, 10) : '';
          const fechaValido = data.fecha_valido_hasta
            ? data.fecha_valido_hasta.substring(0, 10)
            : '';

          const { detalles, ...rest } = data;

          this.form.patchValue({
            ...rest,
            fecha_emision: fechaEmision,
            fecha_valido_hasta: fechaValido,
          });

          if (data.cliente) {
            this.searchSelectLabels['cli_id'] = data.cliente.cli_nom;
          }

          this.patchCustomer(data.cliente);

          this.detailsArray.clear();
          data.detalles.forEach((det: any) => {
            this.detailsArray.push(
              this.#formBuilder.group(
                buildQuotationDetailForm({
                  prod_id: det.prod_id,
                  cantidad: det.cantidad,
                  prod_nom: det.producto?.prod_nom || det.descripcion,
                  prod_cod: det.producto?.prod_cod_interno || '',
                  unidad: det.producto?.unidad.und_nom || '',
                  precio_unitario: det.precio_unitario,
                  dscto: det.descuento || 0,
                  precio_total: det.cantidad * det.precio_unitario - (det.descuento || 0),
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
    customerSearch: (term: string) => this.#customerService.getAll(),
    productSearch: (term: string) =>
      this.#productService.searchQuick({
        term,
        suc_id: this.form.value.suc_id!,
      }),
  };

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
      (control) => control.value.prod_id === this.selectedProduct.prod_id,
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
        prod_id: this.selectedProduct.prod_id,
        cantidad: 1,
        prod_nom: this.selectedProduct.prod_nom,
        prod_cod: this.selectedProduct.prod_cod,
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

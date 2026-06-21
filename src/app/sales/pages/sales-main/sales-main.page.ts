import {
  Component,
  inject,
  Inject,
  OnInit,
  signal,
  ViewChild,
  computed,
  ViewContainerRef,
} from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
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
  SpinnerComponent,
} from '@coreui/angular';
import { IconDirective } from '@coreui/icons-angular';
import { BaseSearchComponent } from '@shared/base/search-base.component';
import { MODULES } from 'src/app/core/config/permissions/modules';
import { SelectOption } from '@shared/types';
import { TypedFormGroup } from '@shared/types/types-form';
import { SearchSelectComponent } from '@shared/components/search-select.component';
import { SaleDetailTableComponent } from 'src/app/sale-detail/components/sale-detail-table.component';
import { SaleDetailForm } from 'src/app/sale-detail/core/types';
import { PaginatorComponent } from 'src/app/paginator/paginator.component';
import { GlobalNotification } from '@shared/alerts/global-notification/global-notification';
import { ConfirmService } from '@shared/confirm-modal/core/services/confirm-modal.service';
import { SaleService } from '../../core/services/sale.service';
import { SaleModel } from '../../core/models/sale.model';
import { SaleForm } from '../../core/types';
import { saleStructure } from '../../helpers/sale-structure';
import { buildSaleForm } from '../../helpers/build-sale-form';
import { buildFilterForm, filterSort, mapParams } from '../../helpers';
import { PageParamsModel } from '@shared/models/query/page-params.model';
import { CurrencyService } from 'src/app/currency/core/services/currency.service';
import { DocumentService } from 'src/app/document/core/services/document.service';
import { CustomerService } from 'src/app/customer/core/services/customer.service';
import { SucursalService } from 'src/app/sucursal/core/services/sucursal.service';
import { ProductService } from 'src/app/products/core/services/product.service';
import { PaymentMethodService } from 'src/app/payment-method/core/services/payment-method.service';
import { DocumentTypeService } from 'src/app/document-type/core/services/document-type.service';
import { OrganizationService } from 'src/app/organization/core/services/organization.service';
import { DateRangePickerComponent } from '@shared/components/date-range-picker/date-range-picker.component';
import { AlmacenService } from 'src/app/almacen/core/services/almacen.service';
import { mapToSelectOption } from '@shared/functions';
import { mapSaleCreateDto } from '../../helpers/map-sale-create-dto';
import {
  SearchDocumentModalComponent,
  SearchDocumentType,
} from '@shared/components/search-document-modal/search-document-modal.component';
import { QuotationModel } from 'src/app/quotation/core/models/quotation.model';
import { GetShippingGuideModel } from 'src/app/shipping-guide/core/models/get-shipping-guide.model';

@Component({
  selector: 'app-sales-main',
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
    SaleDetailTableComponent,
    TableDirective,
    TextColorDirective,
    FormCheckComponent,
    FormCheckInputDirective,
    FormCheckLabelDirective,
    PaginatorComponent,
    DatePipe,
    CurrencyPipe,
    SpinnerComponent,
    DateRangePickerComponent,
    SearchDocumentModalComponent,
  ],
  templateUrl: './sales-main.page.html',
})
export class SalesMainPage extends BaseSearchComponent implements OnInit {
  public activeTab = signal<'create' | 'history'>('create');

  // Documentos vinculados
  public linkedCotizacion = signal<QuotationModel | null>(null);
  public linkedGuia = signal<GetShippingGuideModel | null>(null);
  public isClientReadonly = computed(() => !!(this.linkedCotizacion() || this.linkedGuia()));

  public isLoadingList = signal(false);
  public sales: SaleModel[] = [];
  public totalList = 0;
  public pageList = new PageParamsModel(1, 10);

  public isLoadingForm = signal(false);
  public form!: FormGroup;
  public selectedProduct: any = null;
  public saleId = signal<number | null>(null);
  public showFechaVencimiento = signal(false);

  public structure = signal(saleStructure());
  public title = signal<string>('Historial de Ventas');
  public sucursalOptions = signal<SelectOption[]>([]);
  public almacenOptions = signal<SelectOption[]>([]);
  public almacenError = signal(false);

  availableStates = [
    { id: 2, nombre: 'Pagados', color: 'success' },
    { id: 1, nombre: 'Pendientes', color: 'warning' },
    { id: 3, nombre: 'Anulados', color: 'danger' },
  ];

  readonly #formBuilder = inject(FormBuilder);
  readonly #saleService = inject(SaleService);
  readonly #currencyService = inject(CurrencyService);
  readonly #documentService = inject(DocumentService);
  readonly #customerService = inject(CustomerService);
  readonly #sucursalService = inject(SucursalService);
  readonly #productService = inject(ProductService);
  readonly #paymentMethod = inject(PaymentMethodService);
  readonly #documentTypeService = inject(DocumentTypeService);
  readonly #organizationService = inject(OrganizationService);
  readonly #almacenService = inject(AlmacenService);
  readonly #globalNotification = inject(GlobalNotification);
  readonly #confirmService = inject(ConfirmService);
  readonly #route = inject(ActivatedRoute);

  constructor(@Inject(ViewContainerRef) viewContainerRef: ViewContainerRef) {
    super(MODULES.SALES, viewContainerRef);
  }

  ngOnInit(): void {
    this.formList = this.#formBuilder.group(buildFilterForm());

    const id = this.#route.snapshot.params['id'];
    if (id) {
      this.saleId.set(Number(id));
      this.activeTab.set('create');
    }

    this.loadForm();
    this.loadListData();
  }

  loadForm() {
    this.form = this.#formBuilder.group(buildSaleForm());
    this.loadSelectCombos();
    this.setupPaymentMethodListener();

    this.form.get('suc_id')?.valueChanges.subscribe((value) => {
      if (value) {
        this.loadAlmacenesBySucursal(value);
      }
    });

    if (this.saleId()) {
      // TODO: Load existing sale for edit
    }
  }

  loadListData() {
    this.onSearch();
  }

  get detailsArray(): FormArray<TypedFormGroup<SaleDetailForm>> {
    return this.form.get('detalles') as FormArray<TypedFormGroup<SaleDetailForm>>;
  }

  serviceMap: Record<string, (term: string) => any> = {
    customerSearch: (term: string) => this.#customerService.getAll(),
    productSearch: (term: string) =>
      this.#productService.searchQuick({
        term,
        almacen_id: this.form.get('almacen_id')?.value ?? 0,
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
      return !this.form.get('suc_id')?.value;
    }
    return false;
  }

  openDocumentSearch(type: SearchDocumentType) {
    /* this.searchDocumentModal.openModal(type, (doc) => {
      if (type === 'cotizacion') {
        this.onSelectCotizacion(doc as QuotationModel);
      } else {
        this.onSelectGuia(doc as GetShippingGuideModel);
      }
    }); */
  }

  onSelectCotizacion(cotizacion: QuotationModel) {
    this.linkedCotizacion.set(cotizacion);
    this.form.patchValue({ cot_id: cotizacion.cot_id });
    if (cotizacion.cliente) {
      this.form.patchValue({ cli_id: cotizacion.cli_id });
      this.patchCustomer(cotizacion.cliente);
    }
  }

  onSelectGuia(guia: GetShippingGuideModel) {
    this.linkedGuia.set(guia);
    this.form.patchValue({ guia_id: guia.guia_id });
    if (guia.cliente) {
      this.form.patchValue({ cli_id: guia.cliente.cli_id });
      this.patchCustomer(guia.cliente);
    }
  }

  unlinkCotizacion() {
    this.linkedCotizacion.set(null);
    this.form.patchValue({ cot_id: null });
    if (!this.linkedGuia()) {
      this.clearClientFields();
    }
  }

  unlinkGuia() {
    this.linkedGuia.set(null);
    this.form.patchValue({ guia_id: null });
    if (!this.linkedCotizacion()) {
      this.clearClientFields();
    }
  }

  getClientInitialValue(formControlName: string): string {
    if (formControlName !== 'cli_id') return '';
    const cot = this.linkedCotizacion();
    if (cot?.cliente) return cot.cliente.cli_nom;
    const guia = this.linkedGuia();
    if (guia?.cliente) return guia.cliente.cli_nom;
    return '';
  }

  private clearClientFields() {
    this.form.patchValue({
      cli_id: null,
      cli_documento: null,
      tip_id: null,
      cli_direcc: null,
      cli_correo: null,
      cli_telf: null,
    });
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
        response.data.forEach((item) => {
          documents.push({ value: item.doc_id, label: item.doc_nom });
        });
      },
    });

    this.#documentTypeService.getAll().subscribe({
      next: (response) => {
        response.data.forEach((item) => {
          documentTypes.push({ value: item.tip_id, label: item.tip_nom });
        });
      },
    });

    this.#sucursalService.getAll().subscribe({
      next: (response) => {
        response.data.forEach((item) => {
          sucursalOptions.push({ value: item.suc_id, label: item.suc_nom });
        });
      },
    });

    this.#paymentMethod.getAll().subscribe({
      next: (response) => {
        response.data.forEach((item) => {
          paymentType.push({ value: item.mp_id, label: item.mp_nom });
        });
      },
    });

    this.#organizationService.getAll().subscribe({
      next: (response) => {
        response.data.forEach((item) => {
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
              case 'almacen_id':
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

  loadAlmacenesBySucursal(sucId: number) {
    this.#almacenService.getBySucursal(sucId).subscribe({
      next: (response) => {
        this.almacenOptions.set(mapToSelectOption(response.data, 'almacen_id', 'nombre'));
        this.form.patchValue({ almacen_id: null });
      },
    });
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
      fecha_inicio: formatDateForApi(range.start) ?? null,
      fecha_fin: formatDateForApi(range.end) ?? null,
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

    const saleData = mapSaleCreateDto(this.form.getRawValue());

    this.isLoadingForm.set(true);

    this.#saleService.create(saleData).subscribe({
      next: (response: any) => {
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
        this.#globalNotification.openToastAlert('Error', error.message, 'danger');
      },
    });
  }

  resetForm() {
    this.form.reset();
    this.detailsArray.clear();
    this.saleId.set(null);
    this.selectedProduct = null;
    this.linkedCotizacion.set(null);
    this.linkedGuia.set(null);
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
    this.#saleService.search(params).subscribe({
      next: (response) => {
        this.isLoadingList.set(false);
        if (response.isValid) {
          this.totalList = response.data.total;
          this.sales = response.data.items;
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
        estados: [2, 1],
      });
    }
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
          this.#saleService.delete(id).subscribe({
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

  onPrint(id: number, number_serie: string) {
    this.#saleService.print(id).subscribe({
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
    this.activeTab.set('create');
    this.saleId.set(id);
  }
}

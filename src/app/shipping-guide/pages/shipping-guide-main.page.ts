import { Component, computed, ElementRef, inject, Inject, OnInit, signal, ViewContainerRef } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import {
  ButtonDirective,
  CardBodyComponent,
  CardComponent,
  ColComponent,
  ContainerComponent,
  RowComponent,
  TableDirective,
  TextColorDirective,
  SpinnerComponent,
  InputGroupComponent,
  AlertComponent,
} from '@coreui/angular';
import { IconDirective } from '@coreui/icons-angular';
import { BaseSearchComponent } from '@shared/base/search-base.component';
import { MODULES } from 'src/app/core/config/permissions/modules';
import { SelectOption } from '@shared/types';
import { SearchSelectComponent } from '@shared/components/search-select.component';
import { PaginatorComponent } from 'src/app/shared/components/paginator/paginator.component';
import { GlobalNotification } from '@shared/alerts/global-notification/global-notification';
import { ConfirmService } from '@shared/confirm-modal/core/services/confirm-modal.service';
import { ShippingGuideService } from '../core/services/shipping-guide.service';
import {
  shippingGuideStructure,
  ShippingGuideStructureSection,
} from '../helpers/shipping-guide-structure';
import { PageParamsModel } from '@shared/models/query/page-params.model';
import { CustomerService } from 'src/app/customer/core/services/customer.service';
import { ProductService } from 'src/app/products/core/services/product.service';
import { SucursalService } from 'src/app/sucursal/core/services/sucursal.service';
import { QuotationService } from 'src/app/quotation/core/services/quotation.service';
import { UnitOfMeasureService } from 'src/app/unit-of-measure/core/services/unit-of-measure.service';
import { Observable } from 'rxjs';
import { ResponseDto } from '@shared/models/api/response.dto';
import { GetShippingGuideModel } from '../core/models/get-shipping-guide.model';
import {
  SearchDocumentModalComponent,
  SearchDocumentType,
} from '@shared/components/search-document-modal/search-document-modal.component';
import {
  QuotationDetailModel,
  QuotationModel,
} from 'src/app/quotation/core/models/quotation.model';
import {
  applyCotizacionLock,
  applyTransportValidators,
  buildShippingGuideDetail,
  buildShippingGuideForm,
  SHIPPING_GUIDE_DETAIL_LABELS,
  SHIPPING_GUIDE_LABELS,
  shippingGuideFromApi,
  ShippingGuideEstado,
  toShippingGuidePayload,
} from '../helpers';
import { findMissingFields, focusFirstInvalid } from '@shared/functions';
import { UbigeoPickerComponent } from '@shared/components/ubigeo-picker/ubigeo-picker.component';
import { Sucursal } from 'src/app/sucursal/core/models';
import { GetCustomer } from 'src/app/customer/core/models/get-customer.model';
import { ShippingGuideForm } from '../core/types/shipping-guide.form';
import { TypedFormGroup } from '@shared/types/types-form';
import { DocumentTypeService } from 'src/app/document-type/core/services/document-type.service';

@Component({
  selector: 'app-shipping-guide-main',
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
    TableDirective,
    TextColorDirective,
    SpinnerComponent,
    PaginatorComponent,
    DatePipe,
    SearchDocumentModalComponent,
    AlertComponent,
    UbigeoPickerComponent,
  ],
  templateUrl: './shipping-guide-main.page.html',
})
export class ShippingGuideMainPage extends BaseSearchComponent implements OnInit {
  public activeTab = signal<'create' | 'history'>('create');

  public isLoadingList = signal(false);
  public guides: GetShippingGuideModel[] = [];
  public totalList = 0;
  public pageList = new PageParamsModel(1, 10);

  public isLoadingForm = signal(false);
  public form!: TypedFormGroup<ShippingGuideForm>;
  public selectedProduct: any = null;
  public guideId = signal<number | null>(null);
  public motivoOptions = [
    { label: 'Venta', value: 'Venta' },
    { label: 'Compra', value: 'Compra' },
    {
      label: 'Traslado entre establecimientos de la misma empresa',
      value: 'Traslado entre establecimientos de la misma empresa',
    },
    { label: 'Importación', value: 'Importación' },
    { label: 'Exportación', value: 'Exportación' },
    {
      label: 'Venta sujeta a confirmación del comprador',
      value: 'Venta sujeta a confirmación del comprador',
    },
    { label: 'Traslado emisor itinerante CP', value: 'Traslado emisor itinerante CP' },
    { label: 'Traslado a zona primaria', value: 'Traslado a zona primaria' },
    { label: 'Otros', value: 'otros' },
  ];
  public structure = signal<ShippingGuideStructureSection[]>(shippingGuideStructure());
  public title = signal<string>('Guías de Remisión');

  series: SelectOption[] = [];
  sucursales: SelectOption[] = [];
  unidadesMedida: SelectOption[] = [];
  tiposDocumento: SelectOption[] = [];

  readonly #formBuilder = inject(FormBuilder);
  readonly #shippingGuideService = inject(ShippingGuideService);
  readonly #customerService = inject(CustomerService);
  readonly #productService = inject(ProductService);
  readonly #sucursalService = inject(SucursalService);
  readonly #globalNotification = inject(GlobalNotification);
  readonly #confirmService = inject(ConfirmService);
  readonly #quotationService = inject(QuotationService);
  readonly #unitOfMeasureService = inject(UnitOfMeasureService);
  readonly #documentTypeService = inject(DocumentTypeService);

  // Modal state
  isSearchModalVisible = signal(false);
  searchDocumentType = signal<SearchDocumentType>('cotizacion');

  // State for cotización attachment
  selectedCotizacion = signal<QuotationModel | null>(null);
  isCotizacionAttached = signal(false);
  /** Número de la cotización vinculada (también al editar, donde no hay QuotationModel). */
  linkedQuotationNumber = signal<string | null>(null);

  /** Estado de la guía en edición: Facturado (02) o Anulado (03) la vuelven de solo lectura. */
  editingEstado = signal<ShippingGuideEstado | null>(null);
  editingNumber = signal<string | null>(null);
  isReadOnly = computed(() => ['02', '03'].includes(this.editingEstado()?.codigo ?? ''));
  canEditItems = computed(() => !this.isCotizacionAttached() && !this.isReadOnly());

  sucursalesData: Sucursal[] = [];
  readonly #host = inject(ElementRef<HTMLElement>);

  constructor(@Inject(ViewContainerRef) viewContainerRef: ViewContainerRef) {
    super(MODULES.SALES, viewContainerRef);
  }

  ngOnInit(): void {
    this.formList = this.#formBuilder.group({
      fecha_desde: [''],
      fecha_hasta: [''],
      suc_id: [null],
      search: [''],
    });

    this.loadForm();
    this.loadListData();
  }

  loadForm() {
    this.buildForm();
    this.loadSelectCombos();
  }

  /** Form nuevo con validadores, fechas de hoy y el transporte según el tipo elegido. */
  private buildForm() {
    this.form = this.#formBuilder.group(buildShippingGuideForm());
    const today = this.today();
    this.form.patchValue({ fecha_emision: today, fecha_inicio_traslado: today });
    applyTransportValidators(this.form);
    this.form.get('tipo_traslado')!.valueChanges.subscribe((tipo) => applyTransportValidators(this.form, tipo));
    this.applyPartidaDefault();
  }

  private today(): string {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  /** El punto de partida por defecto es la sucursal que emite (su dirección y ubigeo). */
  private applyPartidaDefault() {
    const sucursal = this.sucursalesData[0];
    if (!sucursal || !this.form) return;
    if (!this.form.get('partida_direccion')!.value && sucursal.address) {
      this.form.patchValue({ partida_direccion: sucursal.address });
    }
    if (!this.form.get('partida_ubigeo')!.value && sucursal.zip) {
      this.form.patchValue({ partida_ubigeo: sucursal.zip });
    }
  }

  loadListData() {
    this.onSearch();
  }

  get detailsArray(): FormArray {
    return this.form.get('detalles') as FormArray;
  }

  serviceMap: Record<string, (term: string) => any> = {
    customerSearch: (term: string) => this.#customerService.searchQuick(term),
    productSearch: (term: string) => this.#productService.searchQuick({ term }),
    cotizacionSearch: (term: string): Observable<ResponseDto<any>> =>
      this.#quotationService.search({
        filter: { nombre: term, estados: ['01'] },
        sort: [{ property: 'fecha_emision', direction: 'desc' }],
        page: { page: 1, pageSize: 20 },
      }),
  };

  getServiceFn(serviceFnName?: string): (term: string) => any {
    if (!serviceFnName) return () => [];
    return this.serviceMap[serviceFnName] || (() => []);
  }

  openCotizacionSearch() {
    this.searchDocumentType.set('cotizacion');
    this.isSearchModalVisible.set(true);
  }

  onSelectDocument(doc: QuotationModel | any) {
    if (this.searchDocumentType() === 'cotizacion') {
      this.onSelectCotizacion(doc as QuotationModel);
    }
  }

  onSelectCotizacion(cotizacion: QuotationModel) {
    this.selectedCotizacion.set(cotizacion);
    this.linkedQuotationNumber.set(cotizacion.fullNumber);
    this.form.patchValue({
      cot_id: cotizacion.id,
      nro_cotizacion: cotizacion.fullNumber,
    });

    if (cotizacion.customer) {
      this.form.patchValue({
        cli_id: cotizacion.customer.id,
        nombre_cliente: cotizacion.customer.name,
        doc_cliente: cotizacion.customer.document,
        direccion_cliente: cotizacion.customer.address,
        destino_direccion: cotizacion.customer.address,
        destino_ubigeo: cotizacion.customer.ubigeoCode ?? null,
      });
    }

    if (cotizacion.details && cotizacion.details.length > 0) {
      this.detailsArray.clear();
      cotizacion.details.forEach((detalle) => {
        const detailForm = this.#formBuilder.group(
          buildShippingGuideDetail({
            prod_id: detalle.productId,
            prod_cod: detalle.productCode ?? '',
            prod_nom: detalle.productName ?? detalle.description ?? '',
            cantidad: detalle.quantity,
            peso_unitario: detalle.productWeight ?? 0,
            descripcion: detalle.description || detalle.productName || '',
            und_id: detalle.productUnitId ?? null,
            // Snapshot del precio de la Cotización: la Guía no muestra precio en su propio
            // PDF, pero lo lleva consigo para que una Venta que se arme desde esta Guía
            // pueda leerlo sin un segundo fetch a la Cotización.
            precio_unitario: detalle.unitPrice ?? null,
            descuento: detalle.discount ?? 0,
          }),
        );
        this.detailsArray.push(detailForm);
      });
    }

    // Cliente y bienes vienen de la cotización: se bloquean desde ya, no recién al editar.
    this.isCotizacionAttached.set(true);
    applyCotizacionLock(this.form, true);
  }

  clearCotizacion() {
    this.selectedCotizacion.set(null);
    this.linkedQuotationNumber.set(null);
    this.isCotizacionAttached.set(false);
    this.form.patchValue({ cot_id: null, nro_cotizacion: null });
    applyCotizacionLock(this.form, false);
  }

  /** Cliente elegido a mano (guía libre): completa sus datos y el destino por defecto. */
  onSelectCustomer(customer: GetCustomer | any) {
    if (!customer) return;
    const nombre =
      customer.businessName || `${customer.firstName ?? ''} ${customer.lastName ?? ''}`.trim();
    this.form.patchValue({
      cli_id: customer.id,
      nombre_cliente: nombre,
      doc_cliente: customer.document,
      direccion_cliente: customer.address,
    });
    if (!this.form.get('destino_direccion')!.value) {
      this.form.patchValue({ destino_direccion: customer.address });
    }
    if (!this.form.get('destino_ubigeo')!.value && customer.ubigeoCode) {
      this.form.patchValue({ destino_ubigeo: customer.ubigeoCode });
    }
  }

  isInvalid(name: string): boolean {
    const control = this.form.get(name);
    return !!control && control.enabled && control.invalid && control.touched;
  }

  onSelectItem(formControlName: string, item: any) {
    if (!item) return;

    if (formControlName === 'prod_id') {
      this.form.patchValue({
        prod_id: item.id,
      });
      this.selectedProduct = item;
      return;
    }

    const control = this.form.get(formControlName);
    if (control) {
      control.setValue(item[formControlName]);
    }
  }

  addProductToDetail() {
    if (!this.selectedProduct) return;
    const detailForm = this.#formBuilder.group(
      buildShippingGuideDetail({
        prod_id: this.selectedProduct.id,
        prod_nom: this.selectedProduct.nombre,
        prod_cod: this.selectedProduct.codigo,
        cantidad: 1,
        und_id: this.selectedProduct.unidad_id ?? null,
        peso_unitario: this.selectedProduct.peso || 0,
        peso_total: (this.selectedProduct.peso || 0) * 1,
        // descripcion es obligatoria pero no hay ningún input en la tabla de detalle para
        // llenarla -- sin esto, agregar cualquier producto deja el form inválido en silencio
        // (el toast de "faltan campos" no dice cuál, y no hay ningún campo visible que resaltar).
        // El nombre del producto es un default razonable: coincide con lo que ya se ve en la
        // columna "Producto" de la misma fila.
        descripcion: this.selectedProduct.nombre,
      }),
    );

    this.detailsArray.push(detailForm);

    this.form.get('prod_id')?.setValue(null);
    this.selectedProduct = null;
  }

  onDetailRemoved(index: number) {
    this.detailsArray.removeAt(index);
  }

  updateDetailTotal(index: number) {
    const detail = this.detailsArray.at(index);
    if (detail) {
      const cantidad = detail.get('cantidad')?.value || 0;
      const pesoUnitario = detail.get('peso_unitario')?.value || 0;
      const pesoTotal = cantidad * pesoUnitario;
      detail.patchValue({ peso_total: pesoTotal });
    }
  }

  getTotalWeight(): number {
    return this.detailsArray.getRawValue().reduce((sum, detail) => {
      return sum + (detail.peso_total || 0);
    }, 0);
  }

  loadSelectCombos() {
    this.#shippingGuideService.getSeries().subscribe({
      next: (response) => {
        this.series = response.data
          .filter(item => item.id != null)
          .map((item) => ({
            value: item.id!,
            label: item.number,
          }));
        this.updateStructure();
      },
    });

    this.#sucursalService.getAll().subscribe({
      next: (response) => {
        this.sucursalesData = response.data;
        this.applyPartidaDefault();
        this.sucursales = response.data
          .filter(item => item.id != null)
          .map((item) => ({
            value: item.id!,
            label: item.name,
          }));
        this.updateStructure();
      },
    });

    this.#unitOfMeasureService.getAll().subscribe({
      next: (response) => {
        this.unidadesMedida = response.data
          .filter(item => item.id != null)
          .map((item) => ({
            value: item.id!,
            label: item.name,
          }));
      },
    });

    this.#documentTypeService.getAll().subscribe({
      next: (response) => {
        this.tiposDocumento = response.data.map((item) => ({
          value: item.name,
          label: item.name,
        }));
      },
    });
  }

  updateStructure() {
    this.structure.set(shippingGuideStructure(this.series, this.sucursales));
  }

  save() {
    if (this.isReadOnly()) return;

    const missing = findMissingFields(this.form, SHIPPING_GUIDE_LABELS, {
      arrayName: 'detalles',
      rowLabel: (i, row) => row.get('prod_nom')?.value || `Producto ${i + 1}`,
      labels: SHIPPING_GUIDE_DETAIL_LABELS,
    });
    if (this.detailsArray.length === 0) {
      missing.push('Bienes transportados (agrega al menos un producto)');
    }

    if (missing.length > 0) {
      this.form.markAllAsTouched();
      this.#confirmService.open({
        title: 'Faltan datos obligatorios',
        message: `Completa lo siguiente antes de guardar:<br>${missing.map((label) => `• ${label}`).join('<br>')}`,
        color: 'danger',
        confirmText: 'Entendido',
        cancelText: '',
      })
        // Al cerrar el aviso, llevar al usuario al primer campo que falta (antes de cerrar, el
        // modal se queda con el foco).
        .then(() => setTimeout(() => focusFirstInvalid(this.#host.nativeElement)));
      return;
    }

    const guideData = toShippingGuidePayload(
      this.form.getRawValue(),
      (this.sucursales[0]?.value as number) ?? null,
    );

    this.isLoadingForm.set(true);

    const request = this.guideId()
      ? this.#shippingGuideService.update(this.guideId()!, guideData)
      : this.#shippingGuideService.create(guideData);

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
        // El backend responde 422 con el motivo (p. ej. guía facturada): mostrarlo tal cual.
        if (error?.error?.messages) {
          this.#globalNotification.openAlert(error.error);
          return;
        }
        this.#globalNotification.openToastAlert('Error', 'No se pudo guardar la guía', 'danger');
      },
    });
  }

  resetForm() {
    this.guideId.set(null);
    this.selectedProduct = null;
    this.selectedCotizacion.set(null);
    this.linkedQuotationNumber.set(null);
    this.isCotizacionAttached.set(false);
    this.editingEstado.set(null);
    this.editingNumber.set(null);
    this.buildForm();
  }

  formList!: FormGroup;

  onSearch(filter = null, page: number = 1) {
    if (!this.formList) {
      this.formList = this.#formBuilder.group({
        fecha_desde: [''],
        fecha_hasta: [''],
        suc_id: [null],
        search: [''],
      });
    }

    const filterToUse = filter ?? {
      ...this.formList.value,
    };

    const pageSize = 10;
    const pageParams = new PageParamsModel(page, pageSize);

    this.pageList = pageParams;

    const params = this.getPageParams();

    this.isLoadingList.set(true);
    this.#shippingGuideService.search(params).subscribe({
      next: (response) => {
        this.isLoadingList.set(false);
        if (response.isValid) {
          this.totalList = response.data.total;
          this.guides = response.data.items;
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
    }
    this.onSearch();
  }

  onDelete(id: number) {
    this.#confirmService
      .open({
        title: 'Eliminar',
        message: '¿Estás seguro de eliminar esta guía de remisión?',
        color: 'danger',
        confirmText: 'Si, eliminar',
        cancelText: 'Cancelar',
      })
      .then((confirmed) => {
        if (confirmed) {
          this.#shippingGuideService.delete(id).subscribe({
            next: (response) => {
              if (response.isValid) {
                this.#globalNotification.openAlert(response);
                this.onSearch();
              } else {
                this.#globalNotification.openAlert(response);
              }
            },
            error: (response) => {
              this.#globalNotification.openToastAlert(
                'Error al eliminar',
                response.messages || 'Error',
                'danger',
              );
            },
          });
        }
      });
  }

  onPrint(id: number, numero: string) {
    this.#shippingGuideService.print(id).subscribe({
      next: (response) => {
        const blob = response.body as Blob;
        const contentDisposition = response.headers.get('content-disposition');
        let filename = `${numero}.pdf`;

        if (contentDisposition) {
          const match = contentDisposition.match(/filename="?([^";\\n]*)"?/);
          if (match && match[1]) {
            filename = match[1];
          }
        }

        const url = globalThis.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
        globalThis.URL.revokeObjectURL(url);
      },
      error: (error) => {
        this.#globalNotification.openAlert(error.error);
      },
    });
  }

  onEdit(id: number) {
    this.activeTab.set('create');
    this.isLoadingForm.set(true);
    this.#shippingGuideService.getById(id).subscribe({
      next: (response) => {
        this.isLoadingForm.set(false);
        if (!response.isValid || !response.data) {
          this.#globalNotification.openAlert(response);
          return;
        }

        const { header, details, estado } = shippingGuideFromApi(response.data);
        this.resetForm();
        this.guideId.set(id);
        this.editingEstado.set(estado);
        this.editingNumber.set(header.numero_completo);

        this.form.patchValue(header);
        details.forEach((detalle) =>
          this.detailsArray.push(this.#formBuilder.group(buildShippingGuideDetail(detalle))),
        );

        const linked = !!header.cot_id;
        this.isCotizacionAttached.set(linked);
        this.linkedQuotationNumber.set(header.nro_cotizacion);
        applyCotizacionLock(this.form, linked);

        if (this.isReadOnly()) {
          this.form.disable({ emitEvent: false });
        }
      },
      error: (error) => {
        this.isLoadingForm.set(false);
        this.#globalNotification.openAlert(error.error);
      },
    });
  }
}

import { Component, inject, Inject, OnInit, signal, ViewContainerRef } from '@angular/core';
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
} from '@coreui/angular';
import { IconDirective } from '@coreui/icons-angular';
import { BaseSearchComponent } from '@shared/base/search-base.component';
import { MODULES } from 'src/app/core/config/permissions/modules';
import { SelectOption } from '@shared/types';
import { SearchSelectComponent } from '@shared/components/search-select.component';
import { PaginatorComponent } from 'src/app/paginator/paginator.component';
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
import { buildShippingGuideForm, buildShippingGuideDetail } from '../helpers';
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
    this.form = this.#formBuilder.group(buildShippingGuideForm());

    const today = new Date().toISOString().split('T')[0];
    this.form.get('fecha_emision')?.setValue(today);

    this.form.patchValue({
      fecha_inicio_traslado: today,
    });

    this.loadSelectCombos();
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
    this.isCotizacionAttached.set(true);
    this.form.patchValue({
      cot_id: cotizacion.cot_id,
      nro_cotizacion: cotizacion.numero_completo,
    });

    if (cotizacion.cliente) {
      this.form.patchValue({
        cli_id: cotizacion.cliente.cli_id,
        nombre_cliente: cotizacion.cliente.cli_nom,
        doc_cliente: cotizacion.cliente.cli_documento,
        direccion_cliente: cotizacion.cliente.cli_direcc,
        destino_direccion: cotizacion.cliente.cli_direcc,
      });
    }

    if (cotizacion.detalles && cotizacion.detalles.length > 0) {
      this.detailsArray.clear();
      cotizacion.detalles.forEach((detalle: any) => {
        const detailForm = this.#formBuilder.group(
          buildShippingGuideDetail({
            prod_id: detalle.prod_id,
            prod_cod: detalle.producto?.prod_cod_interno,
            prod_nom: detalle.descripcion ?? '',
            cantidad: detalle.cantidad,
            peso_unitario: detalle.producto?.prod_peso ?? 0,
            descripcion: detalle.descripcion ?? '',
            und_id: detalle?.producto?.unidad?.und_id ?? null,
          }),
        );
        this.detailsArray.push(detailForm);
      });
    }
  }

  clearCotizacion() {
    this.selectedCotizacion.set(null);
    this.isCotizacionAttached.set(false);
    this.form.patchValue({ cot_id: null, nro_cotizacion: null });
  }

  onSelectItem(formControlName: string, item: any) {
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
  }

  addProductToDetail() {
    debugger;
    if (!this.selectedProduct) return;
    const detailForm = this.#formBuilder.group(
      buildShippingGuideDetail({
        prod_id: this.selectedProduct.prod_id,
        prod_nom: this.selectedProduct.prod_nom,
        prod_cod: this.selectedProduct.prod_cod,
        cantidad: 1,
        peso_unitario: this.selectedProduct.prod_peso || 0,
        peso_total: (this.selectedProduct.prod_peso || 0) * 1,
        descripcion: '',
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
        this.series = response.data.map((item) => ({
          value: item.ser_id,
          label: item.ser_num,
        }));
        this.updateStructure();
      },
    });

    this.#sucursalService.getAll().subscribe({
      next: (response) => {
        this.sucursales = response.data.map((item) => ({
          value: item.suc_id,
          label: item.suc_nom,
        }));
        this.updateStructure();
      },
    });

    this.#unitOfMeasureService.getAll().subscribe({
      next: (response) => {
        this.unidadesMedida = response.data.map((item) => ({
          value: item.und_id,
          label: item.und_nom,
        }));
      },
    });

    this.#documentTypeService.getAll().subscribe({
      next: (response) => {
        this.tiposDocumento = response.data.map((item) => ({
          value: item.tip_nom,
          label: item.tip_nom,
        }));
      },
    });
  }

  updateStructure() {
    this.structure.set(shippingGuideStructure(this.series, this.sucursales));
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

    const guideData = {
      ...this.form.getRawValue(),
      emp_id: 1,
      suc_id: this.form.value.suc_id || this.sucursales[0]?.value,
      detalles: this.detailsArray.getRawValue().map((v) => ({
        prod_id: v.prod_id,
        cantidad: v.cantidad,
        und_id: v.und_id,
        peso_unitario: v.peso_unitario,
        descripcion: v.descripcion,
      })),
    };

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
        this.#globalNotification.openToastAlert(
          'Error',
          error.messages || 'Error al guardar',
          'danger',
        );
      },
    });
  }

  resetForm() {
    this.form.reset();
    this.detailsArray.clear();
    this.guideId.set(null);
    this.selectedProduct = null;
    this.selectedCotizacion.set(null);
    this.isCotizacionAttached.set(false);
    this.form.patchValue({
      fecha_emision: new Date().toISOString().split('T')[0],
      fecha_inicio_traslado: new Date().toISOString().split('T')[0],
    });
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
    this.guideId.set(id);
    this.#shippingGuideService.getById(id).subscribe({
      next: (response) => {
        if (response.isValid) {
          const guia = response.data;
          this.form.patchValue({
            serie_id: guia.serie_id,
            fecha_emision: guia.fecha_emision,
            fecha_inicio_traslado: guia.fecha_inicio_traslado,
            partida_ubigeo: guia.partida_ubigeo,
            partida_direccion: guia.partida_direccion,
            destino_ubigeo: guia.destino_ubigeo,
            destino_direccion: guia.destino_direccion,
            cli_id: guia.cliente?.cli_id,
            tipo_traslado: guia.tipo_traslado,
            motivo_traslado: guia.motivo_traslado,
            transportista_tipo_doc: guia.transportista_tipo_doc,
            transportista_nro_doc: guia.transportista_nro_doc,
            transportista_licencia: guia.transportista_licencia,
            transportista_placa: guia.transportista_placa,
            transportista_direccion: guia.transportista_direccion,
            transportista_vehiculo: guia.transportista_vehiculo,
            empresa_transporte_tipo_doc: guia.empresa_transporte_tipo_doc,
            empresa_transporte_nro_doc: guia.empresa_transporte_nro_doc,
            empresa_transporte_razon_social: guia.empresa_transporte_razon_social,
            nro_cotizacion: guia.nro_cotizacion,
            nro_oc: guia.nro_oc,
            nro_factura: guia.nro_factura,
            fecha_factura: guia.fecha_factura,
            peso_bruto: guia.peso_bruto,
            observaciones: guia.observaciones,
          });

          this.detailsArray.clear();
          guia.detalles?.forEach((detalle: any) => {
            const detailForm = this.#formBuilder.group(
              buildShippingGuideDetail({
                guia_det_id: detalle.guia_det_id,
                prod_id: detalle.prod_id,
                prod_nom: detalle.producto?.prod_nom || '',
                prod_cod: detalle.producto?.prod_cod || '',
                cantidad: detalle.cantidad,
                und_id: detalle.und_id,
                peso_unitario: detalle.peso_unitario,
                peso_total: detalle.peso_total,
                descripcion: detalle.descripcion,
              }),
            );
            this.detailsArray.push(detailForm);
          });
        }
      },
    });
  }
}

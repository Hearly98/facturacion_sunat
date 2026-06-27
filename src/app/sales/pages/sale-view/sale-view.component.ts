import { Component, inject, Inject, OnInit, signal, ViewContainerRef } from '@angular/core';
import {
  CardBodyComponent,
  CardComponent,
  ColComponent,
  ContainerComponent,
  RowComponent,
  ButtonDirective,
  CardHeaderComponent,
  TableDirective,
} from '@coreui/angular';
import { saleStructure } from '../../helpers/sale-structure';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { TypedFormGroup } from '@shared/types/types-form';
import { BaseComponent } from '@shared/base/base.component';
import { MODULES } from 'src/app/core/config/permissions/modules';
import { buildSaleForm } from '../../helpers/build-sale-form';
import { CurrencyService } from 'src/app/currency/core/services/currency.service';
import { SelectOption } from '@shared/types';
import { DocumentService } from 'src/app/document/core/services/document.service';
import { DocumentTypeService } from 'src/app/document-type/core/services/document-type.service';
import { CommonModule } from '@angular/common';
import { SaleDetailTableComponent } from 'src/app/sale-detail/components/sale-detail-table.component';
import { SaleDetailForm } from 'src/app/sale-detail/core/types';
import { IconDirective } from '@coreui/icons-angular';
import { PaymentMethodService } from 'src/app/payment-method/core/services/payment-method.service';
import { SucursalService } from 'src/app/sucursal/core/services/sucursal.service';
import { SaleService } from '../../core/services/sale.service';
import { ActivatedRoute, Router } from '@angular/router';
import { buildSaleDetailForm } from 'src/app/sale-detail/helpers/build-sale-detail-form';
import { OrganizationService } from 'src/app/organization/core/services/organization.service';

@Component({
  selector: 'app-sale-view',
  standalone: true,
  imports: [
    CommonModule,
    RowComponent,
    ColComponent,
    ContainerComponent,
    CardComponent,
    CardBodyComponent,
    CardHeaderComponent,
    ReactiveFormsModule,
    IconDirective,
    SaleDetailTableComponent,
    ButtonDirective,
    TableDirective,
  ],
  template: `
    <c-container [formGroup]="form">
      <c-row class="mb-3">
        <c-col>
          <div class="d-flex justify-content-between align-items-center">
             <h4>{{ saleTitle() }}</h4>
             <nav aria-label="breadcrumb">
                <ol class="breadcrumb">
                  <li class="breadcrumb-item"><a href="javascript:void(0)" (click)="goBack()">Ventas</a></li>
                  <li class="breadcrumb-item active" aria-current="page">Ver</li>
                </ol>
             </nav>
          </div>
        </c-col>
      </c-row>

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
              @switch (control.type) { @case('search-select') {
                <input
                  [value]="getSearchSelectValue(control.formControlName)"
                  class="form-control"
                  disabled
                />
              } @case('select'){
              <select class="form-control form-select" [formControlName]="control.formControlName">
                <option [ngValue]="null">Seleccione</option>
                @for (option of control.options; track $index) {
                <option [ngValue]="option.value">{{ option.label }}</option>
                }
              </select>
              } 
              @case('checkbox') {
                <br>
              <input
                type="checkbox"
                [formControlName]="control.formControlName"
              />
              } @default {
              <input
                [formControlName]="control.formControlName"
                [placeholder]="control.placeholder"
                [type]="control.type"
                class="form-control"
              />
              } }
            </c-col>
            }
          </c-row>
        </c-card-body>
      </c-card>
      }

      <!-- Tabla de detalles -->
      <app-sale-detail-table
        [detailsArray]="detailsArray"
        [showActions]="false"
      ></app-sale-detail-table>

       <!-- Pagos (UI Placeholder) -->
       <c-card class="mb-4 border-success">
        <c-card-header class="bg-success text-white">
          <strong>Datos de Pago</strong>
        </c-card-header>
        <c-card-body>
          <c-row class="g-3">
            <c-col md="2">
              <label>Medio de Pago</label>
              <select class="form-select">
                <option>Seleccione..</option>
              </select>
            </c-col>
            <c-col md="2">
              <label>Medio Pago Detalle</label>
              <select class="form-select">
                <option>Seleccione..</option>
              </select>
            </c-col>
            <c-col md="2">
              <label>Fecha</label>
              <input type="date" class="form-control">
            </c-col>
            <c-col md="2">
              <label>Hora</label>
              <input type="text" class="form-control" placeholder="[ Hora de Pago ]">
            </c-col>
            <c-col md="2">
              <label>Nro de Operación</label>
              <input type="text" class="form-control" placeholder="[ Nro. de Operación ]">
            </c-col>
            <c-col md="2">
              <label>Monto</label>
              <div class="input-group">
                <span class="input-group-text">S/</span>
                <input type="text" class="form-control">
              </div>
            </c-col>
            <c-col md="10">
              <label>Observaciones</label>
              <textarea class="form-control" placeholder="[ Observaciones ]" rows="1"></textarea>
            </c-col>
            <c-col md="2" class="d-flex align-items-end">
              <button cButton color="success" class="w-100">
                <svg cIcon name="cilSave" class="me-2"></svg>
                Guardar
              </button>
            </c-col>
          </c-row>
        </c-card-body>
      </c-card>

      <c-card class="mb-4 border-success">
        <c-card-header class="bg-success text-white py-1">
          <strong class="fs-6">Pagos realizados</strong>
        </c-card-header>
        <c-card-body class="p-0">
          <table cTable striped class="mb-0">
            <thead class="table-light">
              <tr>
                <th>Nro.</th>
                <th>Fecha de Pago</th>
                <th>Hora de Pago</th>
                <th>Forma de Pago</th>
                <th>Deuda</th>
                <th>Monto Pagado</th>
                <th>Saldo</th>
                <th class="text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{{ saleCorrelative() }}</td>
                <td>{{ saleDate() }}</td>
                <td>00:00</td>
                <td><svg cIcon name="cilCreditCard"></svg></td>
                <td>S/. 0.00</td>
                <td>S/. 0.00</td>
                <td>S/. 0.00</td>
                <td class="text-center">
                  <button cButton color="info" size="sm" variant="ghost">
                    <svg cIcon name="cilPrint"></svg>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </c-card-body>
      </c-card>

      <!-- Botones de acción -->
      <c-card class="mb-4">
        <c-card-body>
          <c-row class="align-items-end">
            <c-col md="8" sm="12" class="mb-2">
              <label for="">Observaciones</label>
              <textarea class="form-control" formControlName="venta_coment" rows="3"></textarea>
            </c-col>
            <c-col md="4" sm="12" class="gap-2 text-end">
              <button class="me-2" type="button" cButton color="secondary" (click)="goBack()">
                Volver
              </button>
              <button
                type="button"
                cButton
                color="info"
                class="text-white"
              >
                <svg cIcon name="cilPrint" class="me-2"></svg>
                Imprimir
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
    .breadcrumb {
      margin-bottom: 0;
    }
    .fs-7 {
      font-size: 0.875rem;
    }
  `,
})
export class SaleViewComponent extends BaseComponent implements OnInit {
  structure = signal(saleStructure());
  form!: FormGroup;
  saleData: any = null;
  saleTitle = signal<string>('Detalle de Venta');
  saleCorrelative = signal<string>('');
  saleDate = signal<string>('');
  showFechaVencimiento = signal(false);

  #formBuilder = inject(FormBuilder);
  #currencyService = inject(CurrencyService);
  #documentService = inject(DocumentService);
  #paymentMethodService = inject(PaymentMethodService);
  #documentTypeService = inject(DocumentTypeService);
  #sucursalService = inject(SucursalService);
  #saleService = inject(SaleService);
  #organizationService = inject(OrganizationService);
  #route = inject(ActivatedRoute);
  #router = inject(Router);

  constructor(@Inject(ViewContainerRef) viewContainerRef: ViewContainerRef) {
    super(MODULES.SALES, viewContainerRef);
  }

  ngOnInit() {
    this.form = this.#formBuilder.group(buildSaleForm());
    this.loadSelectCombos();

    this.#route.params.subscribe((params) => {
      const id = params['id'];
      if (id && id !== 'undefined') {
        this.loadSale(id);
      }
    });
  }

  get detailsArray(): FormArray<TypedFormGroup<SaleDetailForm>> {
    return this.form.get('detalles') as FormArray<TypedFormGroup<SaleDetailForm>>;
  }

  loadSale(id: number) {
    this.#saleService.getById(id).subscribe({
      next: (response) => {
        if (response.isValid) {
          this.saleData = response.data;

          // Verificar si es crédito para mostrar fecha de vencimiento
          const isCredito = response.data.mp_id === 2;
          this.showFechaVencimiento.set(isCredito);

          // Actualizar título con correlativo
          const correlativo = response.data.numero_completo || `VENTA-${id}`;
          this.saleTitle.set(`Detalle de Venta - ${correlativo}`);
          this.saleCorrelative.set(correlativo);

          // Formatear fecha
          if (response.data.fecha_emision) {
            const date = new Date(response.data.fecha_emision);
            this.saleDate.set(date.toLocaleDateString('es-ES', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            }));
          }

          this.form.patchValue({
            ...response.data,
            fecha_emision: response.data.fecha_emision ? new Date(response.data.fecha_emision).toISOString().split('T')[0] : null,
            fecha_vencimiento: response.data.fecha_vencimiento ? new Date(response.data.fecha_vencimiento).toISOString().split('T')[0] : null,
            cli_documento: response.data.cliente?.cli_documento,
            cli_direcc: response.data.cliente?.cli_direcc,
            cli_correo: response.data.cliente?.cli_correo,
            cli_telf: response.data.cliente?.cli_telf,
          });

          if (response.data.detalles) {
            this.detailsArray.clear();
            response.data.detalles.forEach((det: any) => {
              this.detailsArray.push(
                buildSaleDetailForm({
                  prod_id: det.prod_id,
                  cantidad: det.detv_cant,
                  prod_nom: det.producto?.prod_nom,
                  prod_cod_interno: det.producto?.prod_cod_interno,
                  unidad: det.producto?.unidad,
                  costo_unitario: det.prod_pventa,
                  precio_unitario: det.prod_pventa,
                  precio_venta: det.prod_pventa,
                  dscto: 0,
                }) as any
              );
            });
          }

          // Recargar estructura con el estado de fecha vencimiento
          this.reloadStructure();

          this.form.disable();
        }
      },
    });
  }

  getSearchSelectValue(controlName: string): string {
    if (!this.saleData) return '';
    if (controlName === 'cli_id') return this.saleData.cliente?.cli_nom || '';
    if (controlName === 'prod_id') return ''; // No aplica en vista detalle general
    return '';
  }

  loadSelectCombos() {
    const currencies: SelectOption[] = [];
    const documents: SelectOption[] = [];
    const paymentType: SelectOption[] = [];
    const documentTypes: SelectOption[] = [];
    const sucursalOptions: SelectOption[] = [];
    const companies: SelectOption[] = [];
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

    this.#paymentMethodService.getAll().subscribe({
      next: (response) => {
        response.data.map((item) => {
          paymentType.push({ value: item.mp_id, label: item.mp_nom });
        });
      },
    });

    this.#organizationService.getAll().subscribe({
      next: (response) => {
        response.data.map((item) => {
          companies.push({ value: item.emp_id, label: item.emp_nom });
        });
      },
    })

    this.structure.set(
      saleStructure(currencies, paymentType, documents, documentTypes, sucursalOptions, companies, [], this.showFechaVencimiento())
    );
  }

  reloadStructure() {
    const currentStructure = this.structure();
    const currencies: SelectOption[] = [];
    const documents: SelectOption[] = [];
    const paymentType: SelectOption[] = [];
    const documentTypes: SelectOption[] = [];
    const sucursalOptions: SelectOption[] = [];
    const companies: SelectOption[] = [];

    currentStructure.forEach(section => {
      section.controls.forEach(control => {
        if (control.type === 'select' && 'options' in control) {
          switch (control.formControlName) {
            case 'mon_id':
              currencies.push(...control.options);
              break;
            case 'mp_cod':
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
              companies.push(...control.options);
              break;
          }
        }
      });
    });

    this.structure.set(
      saleStructure(currencies, paymentType, documents, documentTypes, sucursalOptions, companies, [], this.showFechaVencimiento())
    );
  }

  goBack() {
    this.#router.navigate(['/listado-ventas']);
  }
}

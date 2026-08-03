import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormArray, ReactiveFormsModule } from '@angular/forms';
import {
  ButtonDirective,
  ColComponent,
  RowComponent,
  TableDirective,
} from '@coreui/angular';
import { IconDirective } from '@coreui/icons-angular';

@Component({
  selector: 'app-quotation-detail-table',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RowComponent,
    ColComponent,
    TableDirective,
    ButtonDirective,
    IconDirective,
    CurrencyPipe,
  ],
  template: `
        <c-row>
          <c-col [md]="12">
            @if (detailsArray.length > 0) {
            <table cTable striped="true">
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Producto</th>
                  <th>Unidad</th>
                  <th>Cantidad</th>
                  <th>Precio Unit.</th>
                  <th>Descuento</th>
                  <th>Total</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody *ngFor="let detail of detailsArray.controls; let i = index">
                <tr [formGroup]="$any(detailsArray.at(i))">
                  <td>{{ detail.value.prod_cod }}</td>
                  <td>{{ detail.value.prod_nom }}</td>
                  <td>{{ detail.value.unidad }}</td>
                  <td>
                    <input
                      type="number"
                      class="form-control form-control-sm"
                      formControlName="cantidad"
                      min="1"
                      (change)="onQuantityChange(i)"
                      style="width: 80px"
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      class="form-control form-control-sm"
                      formControlName="precio_unitario"
                      min="0"
                      step="0.01"
                      (change)="onPriceChange(i)"
                      style="width: 100px"
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      class="form-control form-control-sm"
                      formControlName="dscto"
                      min="0"
                      step="0.01"
                      (change)="onDiscountChange(i)"
                      style="width: 80px"
                    />
                  </td>
                  <td>{{ calculateTotal(i) | currency: 'S/. ' }}</td>
                  <td>
                    <button
                      type="button"
                      cButton
                      color="danger"
                      size="sm"
                      (click)="removeDetail(i)"
                    >
                      <svg cIcon name="cilTrash"></svg>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
             <c-row class="align-items-end text-end flex-column fs-7">
          <c-col md="12" class="mb-2">
            <c-row>
              <c-col><strong>DSCTO. TOTAL:</strong></c-col>
              <c-col md="2">
                <input
                  type="text"
                  class="form-control form-control-sm"
                  [value]="totalDescuento | currency: 'S/. '"
                  readonly
                />
              </c-col>
            </c-row>
          </c-col>

          <c-col md="12" class="mb-2">
            <c-row>
              <c-col><strong>BASE I.G.V:</strong></c-col>
              <c-col md="2">
                <input
                  type="text"
                  class="form-control form-control-sm"
                  [value]="baseIgv | currency: 'S/. '"
                  readonly
                />
              </c-col>
            </c-row>
          </c-col>

          <c-col md="12" class="mb-2">
            <c-row>
              <c-col><strong>I.G.V. (18%):</strong></c-col>
              <c-col md="2">
                <input
                  type="text"
                  class="form-control form-control-sm"
                  [value]="igv | currency: 'S/. '"
                  readonly
                />
              </c-col>
            </c-row>
          </c-col>

          <c-col md="12">
            <c-row>
              <c-col><strong>TOTAL A PAGAR:</strong></c-col>
              <c-col md="2">
                <input
                  type="text"
                  class="form-control form-control-sm"
                  [value]="grandTotal | currency: 'S/. '"
                  readonly
                />
              </c-col>
            </c-row>
          </c-col>
        </c-row>
            }
          </c-col>
        </c-row>
  `,
})
export class QuotationDetailTableComponent {
  @Input() detailsArray!: FormArray;
  @Input() igvRequerido: boolean = false;
  @Output() detailRemoved = new EventEmitter<number>();

  get subtotal(): number {
    const total = this.detailsArray.controls.reduce((sum, control) => {
      const cantidad = control.get('cantidad')?.value || 0;
      const precioUnitario = control.get('precio_unitario')?.value || 0;
      const descuento = control.get('dscto')?.value || 0;

      const ventaLinea = (precioUnitario * cantidad) - descuento;
      return sum + ventaLinea;
    }, 0);
    return Math.round(total * 100) / 100;
  }

  get baseIgv(): number {
    if (!this.igvRequerido) return 0;
    return this.subtotal;
  }

  get totalDescuento(): number {
    const total = this.detailsArray.controls.reduce((sum, control) => {
      return sum + (control.get('dscto')?.value || 0);
    }, 0);
    return Math.round(total * 100) / 100;
  }

  get igv(): number {
    if (!this.igvRequerido) return 0;
    return Math.round(this.baseIgv * 0.18 * 100) / 100;
  }

  get grandTotal(): number {
    if (!this.igvRequerido) {
      return this.subtotal;
    }
    return Math.round((this.baseIgv + this.igv) * 100) / 100;
  }

  calculateTotal(index: number): number {
    const detail = this.detailsArray.at(index);
    const cantidad = detail.get('cantidad')?.value || 0;
    const precioUnitario = detail.get('precio_unitario')?.value || 0;
    const descuento = detail.get('dscto')?.value || 0;

    // Cálculo por línea: (precio * cantidad) - descuento
    const total = Math.round(((cantidad * precioUnitario) - descuento) * 100) / 100;

    detail.patchValue({ precio_total: total }, { emitEvent: false });
    return total;
  }

  onQuantityChange(index: number): void {
    this.calculateTotal(index);
  }

  onPriceChange(index: number): void {
    this.calculateTotal(index);
  }

  onDiscountChange(index: number): void {
    this.calculateTotal(index);
  }

  removeDetail(index: number): void {
    this.detailsArray.removeAt(index);
    this.detailRemoved.emit(index);
  }
}

import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  signal,
} from '@angular/core';
import { FormArray, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import {
  TableDirective,
  CardComponent,
  CardBodyComponent,
  RowComponent,
  ColComponent,
  ButtonDirective,
} from '@coreui/angular';
import { IconDirective } from '@coreui/icons-angular';
import { TypedFormGroup } from '@shared/types/types-form';
import { MovimientoDetailForm } from '../core/types/movement-detail-form';

@Component({
  selector: 'app-movimiento-detail-table',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TableDirective,
    CardComponent,
    CardBodyComponent,
    RowComponent,
    ColComponent,
    ButtonDirective,
    IconDirective,
  ],
  template: `
    <c-card class="mb-4">
      <c-card-body>
        <c-row>
          <c-col>
            <h5>Detalle de Productos</h5>
          </c-col>
        </c-row>
        <table cTable [striped]="true" [hover]="true" class="table-responsive">
          <thead>
            <tr>
              <th style="width: 5%">#</th>
              <th style="width: 25%">Codigo</th>
              <th style="width: 50%">Producto</th>
              <th style="width: 15%">Cantidad</th>
              <th style="width: 15%">Costo Unitario</th>
              @if (showActions) {
              <th style="width: 5%"></th>
              }
            </tr>
          </thead>
          <tbody>
            @if (detailsArray.length === 0) {
            <tr>
              <td colspan="6" class="text-center text-muted py-4">No hay productos agregados</td>
            </tr>
            } @for (detail of detailsArray.controls; track $index) {
            <tr [formGroup]="detail">
              <td>{{ $index + 1 }}</td>
              <td>
                <p class="form-control form-control-sm" style="border: none; background: transparent;">{{ detail.value.codigoProducto }}</p>
              </td>
              <td>
                <p class="form-control form-control-sm" style="border: none; background: transparent;">{{ detail.value.nombreProducto }}</p>
              </td>
              <td>
                <input
                  type="number"
                  class="form-control form-control-sm"
                  formControlName="cantidad"
                  min="0.0001"
                  step="0.0001"
                />
              </td>
              <td>
                <input
                  type="number"
                  class="form-control form-control-sm"
                  formControlName="costoUnitario"
                  min="0.0001"
                  step="0.0001"
                />
              </td>
              @if (showActions) {
              <td>
                <button
                  type="button"
                  cButton
                  color="danger"
                  size="sm"
                  (click)="removeDetail($index)"
                  title="Eliminar"
                >
                  <svg cIcon name="cilTrash" size="sm"></svg>
                </button>
              </td>
              }
            </tr>
            }
          </tbody>
        </table>
        <c-row class="align-items-end text-end">
          <c-col>
            <strong>Total Items:</strong> {{ totalItems() }}
          </c-col>
        </c-row>
      </c-card-body>
    </c-card>
  `,
  styles: [],
})
export class MovimientoDetailTableComponent implements OnInit, OnChanges {
  @Input() detailsArray!: FormArray<TypedFormGroup<MovimientoDetailForm>>;
  @Input() showActions: boolean = true;
  @Output() detailRemoved = new EventEmitter<number>();

  totalItems = signal(0);

  ngOnInit() {
    this.detailsArray.valueChanges.subscribe(() => {
      this.recalculate();
    });
    this.recalculate();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['detailsArray'] && this.detailsArray) {
      this.recalculate();
    }
  }

  recalculate() {
    const rows = this.detailsArray.getRawValue();
    let total = 0;
    rows.forEach((r) => {
      total += Number(r.cantidad) || 0;
    });
    this.totalItems.set(Math.round(total * 10000) / 10000);
  }

  removeDetail(index: number) {
    this.detailsArray.removeAt(index);
    this.detailRemoved.emit(index);
  }
}

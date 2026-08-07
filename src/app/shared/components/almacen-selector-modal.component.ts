import { Component, inject, Input, OnChanges, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ModalComponent,
  ModalBodyComponent,
  ModalHeaderComponent,
  ModalTitleDirective,
  ModalFooterComponent,
  ButtonDirective,
  FormCheckComponent,
  FormCheckInputDirective,
  FormCheckLabelDirective,
  RowComponent,
  ColComponent,
  CardBodyComponent,
  CardComponent,
  ButtonCloseDirective,
  SpinnerComponent,
} from '@coreui/angular';
import { BadgeModule } from '@coreui/angular';
import { IconDirective } from '@coreui/icons-angular';
import { AlmacenService } from 'src/app/almacen/core/services/almacen.service';
import { GetAlmacenModel } from 'src/app/almacen/core/models';
import { Sucursal } from 'src/app/sucursal/core/models';

interface SucursalView {
  id: number;
  name: string;
}

interface SelectedAlmacen {
  suc_id: number;
  almacen_id: number;
  almacen: GetAlmacenModel;
}

@Component({
  selector: 'app-almacen-selector-modal',
  standalone: true,
  imports: [
    CommonModule,
    ModalComponent,
    ModalBodyComponent,
    ModalHeaderComponent,
    CardComponent,
    CardBodyComponent,
    ModalTitleDirective,
    ModalFooterComponent,
    ButtonDirective,
    ButtonCloseDirective,
    FormCheckComponent,
    FormCheckInputDirective,
    FormCheckLabelDirective,
    IconDirective,
    RowComponent,
    ColComponent,
    SpinnerComponent,
    BadgeModule,
  ],
  template: `
    <c-modal
      class="modal-background"
      alignment="center"
      [visible]="visible()"
      backdrop="static"
      size="lg"
    >
      <c-modal-header>
        <h5 cModalTitle>
          <svg cIcon name="cil-warehouse" class="me-2"></svg>
          Seleccionar Almacenes por Sucursal
        </h5>
        <button cButtonClose (click)="onClose()"></button>
      </c-modal-header>
      <c-modal-body>
        @if (loading()) {
          <div class="text-center py-5">
            <c-spinner variant="grow" size="sm"></c-spinner>
            <span class="ms-2">Cargando almacenes...</span>
          </div>
        } @else {
          <c-card class="mb-3 border-primary-subtle">
            <c-card-body class="bg-light">
              <div class="d-flex justify-content-between align-items-center">
                <span class="text-muted">
                  <svg cIcon name="cil-info" class="me-1"></svg>
                  {{ selectedAlmacenes().length }} almacén(es) seleccionado(s)
                </span>
                <div>
                  <button cButton color="link" size="sm" (click)="selectAll()" class="me-2">
                    Seleccionar todos
                  </button>
                  <button cButton color="link" size="sm" (click)="clearAll()">Limpiar</button>
                </div>
              </div>
            </c-card-body>
          </c-card>

          <c-row class="g-3">
            @for (sucursal of sucursales; track sucursal.id) {
              <c-col xs="12">
                <c-card class="mb-2">
                  <c-card-body>
                    <div class="d-flex justify-content-between align-items-center mb-3">
                      <h6 class="mb-0">
                        <svg cIcon name="cil-building" class="me-2 text-primary"></svg>
                        {{ sucursal.name }}
                      </h6>
                      @if (getAlmacenesBySucursal(sucursal.id).length > 0) {
                        <c-badge color="secondary">
                          {{ getSelectedCountBySucursal(sucursal.id) }}/{{
                            getAlmacenesBySucursal(sucursal.id).length
                          }}
                        </c-badge>
                      }
                    </div>

                    @if (getAlmacenesBySucursal(sucursal.id).length > 0) {
                      <c-row class="g-2">
                        @for (almacen of getAlmacenesBySucursal(sucursal.id); track almacen.id) {
                          <c-col xs="12" md="6">
                            <c-form-check class="almacen-item">
                              <input
                                cFormCheckInput
                                type="checkbox"
                                [id]="'alm_' + sucursal.id + '_' + almacen.id"
                                [checked]="isAlmacenSelected(sucursal.id, almacen.id)"
                                (change)="toggleAlmacen(sucursal.id, almacen)"
                              />
                              <label
                                cFormCheckLabel
                                [for]="'alm_' + sucursal.id + '_' + almacen.id"
                              >
                                <span class="fw-medium">{{ almacen.codigo }}</span>
                                <span class="text-muted ms-2">{{ almacen.nombre }}</span>
                              </label>
                            </c-form-check>
                          </c-col>
                        }
                      </c-row>
                    } @else {
                      <div class="text-muted text-center py-2 border rounded bg-light">
                        <svg cIcon name="cil-warehouse" class="me-1"></svg>
                        No hay almacenes activos para esta sucursal
                      </div>
                    }
                  </c-card-body>
                </c-card>
              </c-col>
            }

            @if (sucursales.length === 0) {
              <c-col xs="12">
                <div class="text-center text-muted py-4">No hay sucursales disponibles</div>
              </c-col>
            }
          </c-row>
        }
      </c-modal-body>
      <c-modal-footer>
        <button cButton color="secondary" (click)="onClose()">
          <svg cIcon name="cilX"></svg>
          Cancelar
        </button>
        <button cButton color="primary" (click)="onConfirm()">
          <svg cIcon name="cilCheckAlt"></svg>
          Confirmar ({{ selectedAlmacenes().length }})
        </button>
      </c-modal-footer>
    </c-modal>
  `,
  styles: `
    :host {
      display: contents;
    }

    .almacen-item {
      padding: 0.5rem;
      border-radius: 0.375rem;
      transition: background-color 0.15s ease-in-out;
    }

    .almacen-item:hover {
      background-color: #f8f9fa;
    }

    .almacen-item c-form-check-input:checked + c-form-check-label {
      color: var(--cui-primary);
    }
  `,
})
export class AlmacenSelectorModalComponent implements OnChanges {
  @Input() almacenesPorSucursal: { [sucId: number]: GetAlmacenModel[] } = {};

  visible = signal(false);
  selectedAlmacenes = signal<SelectedAlmacen[]>([]);
  loading = signal(false);
  sucursales: SucursalView[] = [];
  callback: ((almacenes: SelectedAlmacen[]) => void) | null = null;

  #almacenService = inject(AlmacenService);

  ngOnChanges(): void {
    if (this.almacenesPorSucursal) {
      this.sucursales = Object.keys(this.almacenesPorSucursal).map((sucId) => {
        const almacen = this.almacenesPorSucursal[Number(sucId)][0];
        return {
          id: Number(sucId),
          name: almacen?.sucursal?.name || `Sucursal ${sucId}`,
        };
      });
    }
  }

  openModal(preselected: SelectedAlmacen[] = [], callback: (almacenes: SelectedAlmacen[]) => void) {
    this.selectedAlmacenes.set([...preselected]);
    this.callback = callback;
    this.visible.set(true);
  }

  getAlmacenesBySucursal(sucId: number): GetAlmacenModel[] {
    return this.almacenesPorSucursal[sucId] || [];
  }

  getSelectedCountBySucursal(sucId: number): number {
    return this.selectedAlmacenes().filter((a) => a.suc_id === sucId).length;
  }

  isAlmacenSelected(sucId: number, almId: number): boolean {
    return this.selectedAlmacenes().some((a) => a.suc_id === sucId && a.almacen_id === almId);
  }

  toggleAlmacen(sucId: number, almacen: GetAlmacenModel) {
    const current = this.selectedAlmacenes();
    const existing = current.findIndex((a) => a.suc_id === sucId && a.almacen_id === almacen.id);

    if (existing > -1) {
      current.splice(existing, 1);
    } else {
      current.push({ suc_id: sucId, almacen_id: almacen.id, almacen });
    }

    this.selectedAlmacenes.set([...current]);
  }

  selectAll() {
    const all: SelectedAlmacen[] = [];
    Object.keys(this.almacenesPorSucursal).forEach((sucId) => {
      const almCount = this.almacenesPorSucursal[Number(sucId)];
      if (almCount) {
        almCount.forEach((alm) => {
          all.push({ suc_id: Number(sucId), almacen_id: alm.id, almacen: alm });
        });
      }
    });
    this.selectedAlmacenes.set(all);
  }

  clearAll() {
    this.selectedAlmacenes.set([]);
  }

  onConfirm() {
    if (this.callback) {
      this.callback(this.selectedAlmacenes());
    }
    this.onClose();
  }

  onClose() {
    this.visible.set(false);
  }

  onVisibleChange(isVisible: boolean) {
    if (!isVisible) {
      this.visible.set(false);
    }
  }
}

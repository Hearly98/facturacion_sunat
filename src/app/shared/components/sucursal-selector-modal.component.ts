import { Component, inject, signal } from '@angular/core';
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
} from '@coreui/angular';
import { IconDirective } from '@coreui/icons-angular';
import { SucursalService } from 'src/app/sucursal/core/services/sucursal.service';
import { Sucursal } from 'src/app/sucursal/core/models';

@Component({
  selector: 'app-sucursal-selector-modal',
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
  ],
  template: `
    <c-modal class="modal-background" alignment="center" [visible]="visible()" backdrop="static">
      <c-modal-header>
        <h5 cModalTitle>Seleccionar Sucursales</h5>
        <button cButtonClose (click)="onClose()"></button>
      </c-modal-header>
      <c-modal-body>
        <c-card>
          <c-card-body>
            <c-row class="g-3">
          <c-col xs="12">
            <div class="d-flex justify-content-between align-items-center mb-3">
              <span class="text-muted">
                {{ selectedSucursales().length }} de {{ sucursales.length }} seleccionadas
              </span>
              <div>
                <button cButton color="link" size="sm" (click)="selectAll()" class="me-2">
                  Seleccionar todas
                </button>
                <button cButton color="link" size="sm" (click)="clearAll()">
                  Limpiar
                </button>
              </div>
            </div>
          </c-col>
          @for (sucursal of sucursales; track sucursal.id) {
            <c-col xs="12" md="12">
              <c-form-check>
                <input
                  cFormCheckInput
                  type="checkbox"
                  [id]="'suc_' + sucursal.id"
                  [checked]="isSucursalSelected(sucursal.id!)"
                  (change)="toggleSucursal(sucursal.id!)"
                />
                <label cFormCheckLabel [for]="'suc_' + sucursal.id">
                  {{ sucursal.name }}
                </label>
              </c-form-check>
            </c-col>
          }
          @if (sucursales.length === 0) {
            <c-col xs="12">
              <div class="text-center text-muted py-4">
                No hay sucursales disponibles
              </div>
            </c-col>
          }
        </c-row>
          </c-card-body>
        </c-card>
      </c-modal-body>
      <c-modal-footer>
        <button cButton color="secondary" (click)="onClose()">
          <svg cIcon name="cilX"></svg>
          Cancelar
        </button>
        <button cButton color="primary" (click)="onConfirm()">
          <svg cIcon name="cilCheckAlt"></svg>
          Confirmar ({{ selectedSucursales().length }})
        </button>
      </c-modal-footer>
    </c-modal>
  `,
  styles: `
    :host {
      display: contents;
    }
  `,
})
export class SucursalSelectorModalComponent {
  visible = signal(false);
  selectedSucursales = signal<number[]>([]);
  sucursales: Sucursal[] = [];
  callback: ((sucursales: number[]) => void) | null = null;

  #sucursalService = inject(SucursalService);

  openModal(preselectedIds: number[] = [], callback: (sucursales: number[]) => void) {
    this.selectedSucursales.set([...preselectedIds]);
    this.callback = callback;
    this.loadSucursales();
    this.visible.set(true);
  }

  loadSucursales() {
    this.#sucursalService.getAll().subscribe({
      next: (response) => {
        if (response.isValid) {
          this.sucursales = response.data;
        }
      },
      error: (error) => {
        console.error('Error loading sucursales:', error);
      },
    });
  }

  toggleSucursal(sucId: number) {
    const current = this.selectedSucursales();
    const index = current.indexOf(sucId);

    if (index > -1) {
      current.splice(index, 1);
    } else {
      current.push(sucId);
    }

    this.selectedSucursales.set([...current]);
  }

  isSucursalSelected(sucId: number): boolean {
    return this.selectedSucursales().includes(sucId);
  }

  selectAll() {
    const allIds = this.sucursales.filter(s => s.id !== null).map(s => s.id as number);
    this.selectedSucursales.set(allIds);
  }

  clearAll() {
    this.selectedSucursales.set([]);
  }

  onConfirm() {
    if (this.callback) {
      this.callback(this.selectedSucursales());
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

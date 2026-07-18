import { Component, Inject, inject, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import {
  ModalComponent,
  ModalHeaderComponent,
  ModalTitleDirective,
  ModalBodyComponent,
  ModalFooterComponent,
  ButtonDirective,
  CardComponent,
  CardBodyComponent,
  RowComponent,
  ColComponent,
} from '@coreui/angular';
import { buildSerieForm } from '../helpers/build-serie-form';
import { SerieService } from '../core/services/serie.service';
import { CreateSerie, UpdateSerie } from '../core/models';
import { GlobalNotification } from '@shared/alerts/global-notification/global-notification';
import { GetDocumentModel } from 'src/app/document/core/models/get-document.model';
import { BaseComponent } from '@shared/base/base.component';
import { MODULES } from 'src/app/core/config/permissions/modules';
import { DocumentService } from 'src/app/document/core/services/document.service';

@Component({
  selector: 'app-serie-modal',
  standalone: true,
  imports: [
    CommonModule,
    CardComponent,
    CardBodyComponent,
    RowComponent,
    ColComponent,
    ReactiveFormsModule,
    ModalComponent,
    ModalHeaderComponent,
    ModalTitleDirective,
    ModalBodyComponent,
    ModalFooterComponent,
    ButtonDirective,
  ],
  template: `
    <c-modal #modal [visible]="visible" (visibleChange)="handleVisibleChange($event)">
      <c-modal-header>
        <h5 cModalTitle>{{ isEdit ? 'Editar Serie' : 'Nueva Serie' }}</h5>
      </c-modal-header>
      <c-modal-body>
        <c-card>
          <c-card-body>
            <c-row [formGroup]="form">
              <c-col md="12" class="mb-3">
                <label for="code" class="form-label">Código de Documento SUNAT</label>
                <select formControlName="code" class="form-control form-select" id="code">
                  <option [ngValue]="null">Seleccione</option>
                  @for (item of documentos; track $index) {
                    <option [ngValue]="item.codigo">{{ item.name }}</option>
                  }
                </select>
              </c-col>
              <c-col md="12" class="mb-3">
                <label for="number" class="form-label">Número de Serie</label>
                <input
                  formControlName="number"
                  type="text"
                  class="form-control"
                  id="number"
                  placeholder="Ej: F001, B001, GR01, COT"
                />
              </c-col>
              <c-col md="12" class="mb-3">
                <label for="counter" class="form-label">Correlativo Inicial</label>
                <input
                  formControlName="counter"
                  type="text"
                  class="form-control"
                  id="counter"
                  min="1"
                />
              </c-col>
            </c-row>
          </c-card-body>
        </c-card>
      </c-modal-body>
      <c-modal-footer>
        <button cButton color="secondary" (click)="closeModal()">Cancelar</button>
        <button cButton color="primary" (click)="save()" [disabled]="!form.valid">
          {{ isEdit ? 'Actualizar' : 'Guardar' }}
        </button>
      </c-modal-footer>
    </c-modal>
  `,
})
export class SerieModalComponent extends BaseComponent implements OnInit {
  @ViewChild('modal') modal!: ModalComponent;
  visible = false;
  isEdit = false;
  serieId?: number;
  form!: FormGroup;
  documentos: GetDocumentModel[] = [];
  onSaveCallback?: () => void;

  #formBuilder = inject(FormBuilder);
  #serieService = inject(SerieService);
  #globalNotification = inject(GlobalNotification);
  #documentService = inject(DocumentService);
  constructor(@Inject(ViewContainerRef) viewContainerRef: ViewContainerRef) {
    super(MODULES.SERIES, viewContainerRef);
    this.form = this.#formBuilder.group(buildSerieForm());
  }

  ngOnInit(): void {
    this.loadSelectCombos();
  }

  openModal(id?: number, callback?: () => void) {
    this.onSaveCallback = callback;
    this.isEdit = !!id;
    this.serieId = id;

    if (id) {
      this.loadSerie(id);
    } else {
      this.form.reset();
      this.form.patchValue({ counter: 1 });
    }

    this.visible = true;
  }

  loadSerie(id: number) {
    this.#serieService.getById(id).subscribe({
      next: (response) => {
        if (response.isValid) {
          this.form.patchValue(response.data);
        }
      },
    });
  }

  save() {
    if (this.form.invalid) return;

    const data = this.form.value as CreateSerie | UpdateSerie;
    const request = this.isEdit
      ? this.#serieService.update(this.serieId!, data as UpdateSerie)
      : this.#serieService.create(data as CreateSerie);

    request.subscribe({
      next: (response) => {
        if (response.isValid) {
          this.#globalNotification.openAlert(response);
          this.closeModal();
          this.onSaveCallback?.();
        } else {
          this.#globalNotification.openAlert(response);
        }
      },
      error: (error) => {
        this.#globalNotification.openToastAlert('Error', error.messages, 'danger');
      },
    });
  }

  closeModal() {
    this.visible = false;
    this.form.reset();
  }

  handleVisibleChange(visible: boolean) {
    this.visible = visible;
  }

  loadSelectCombos() {
    this.fetchData(this.#documentService.getAll(), this.documents);
  }
}

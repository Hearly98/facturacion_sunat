import { Component, Inject, inject, OnInit, signal, ViewContainerRef } from '@angular/core';
import {
  ButtonDirective,
  CardBodyComponent,
  CardComponent,
  ColComponent,
  ModalBodyComponent,
  ModalComponent,
  RowComponent,
  SpinnerComponent,
} from '@coreui/angular';
import { IconDirective } from '@coreui/icons-angular';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { TypedFormGroup } from '../../../shared/types/types-form';
import { MODULES } from '../../../core/config/permissions/modules';
import { GlobalNotification } from '../../../shared/alerts/global-notification/global-notification';
import { BaseComponent } from '@shared/base/base.component';
import { DocumentTypeForm } from '../../core/types/document-type-form';
import {
  buildDocumentTypeForm,
  documentTypeErrorMessages,
  documentTypeStructure,
} from '../../helpers';
import { DocumentTypeService } from '../../core/services/document-type.service';
import { CreateDocumentTypeModel, UpdateDocumentTypeModel } from '../../core/models';
import { ValidationMessagesComponent } from '@shared/components/error-messages/validation-messages.component';

@Component({
  selector: 'app-document-type-new-edit-modal',
  imports: [
    CardComponent,
    CardBodyComponent,
    ModalBodyComponent,
    ModalComponent,
    RowComponent,
    ColComponent,
    ButtonDirective,
    IconDirective,
    ReactiveFormsModule,
    ValidationMessagesComponent,
    SpinnerComponent,
  ],
  templateUrl: './document-type-new-edit-modal.component.html',
})
export class DocumentTypeNewEditModalComponent extends BaseComponent implements OnInit {
  form!: TypedFormGroup<DocumentTypeForm>;
  visible = false;
  isLoading = signal(false);
  structure = documentTypeStructure;
  messages = documentTypeErrorMessages();
  readonly #globalNotification = inject(GlobalNotification);
  readonly #documentTypeService = inject(DocumentTypeService);
  readonly #formBuilder = inject(FormBuilder);
  title = signal('');
  callback: any;

  constructor(@Inject(ViewContainerRef) viewContainerRef: ViewContainerRef) {
    super(MODULES.DOCUMENT_TYPE, viewContainerRef);
  }

  ngOnInit(): void {
    this.createForm();
  }

  createForm() {
    this.form = this.#formBuilder.group(buildDocumentTypeForm());
  }

  openModal(idDocumentType?: number, callback: any = null) {
    this.title.set('Crear Tipo Documento');
    this.createForm();
    this.visible = true;
    this.callback = callback;
    if (idDocumentType) {
      this.title.set('Editar Tipo de Documento');
      this.loadData(idDocumentType);
    }
  }

  loadData(idDocumentType: number) {
    this.#documentTypeService.getById(idDocumentType).subscribe({
      next: (response) => {
        if (response.isValid) {
          this.form.patchValue(response.data);
        }
      },
    });
  }

  onClose() {
    this.visible = false;
  }

  onSubmit() {
    if (this.form.valid) {
      this.isLoading.set(true);
      if (this.form.value.id) {
        this.update();
      } else {
        this.create();
      }
    } else {
      this.form.markAllAsTouched();
    }
  }

  create() {
    const { id, ...body } = this.form.value;
    const subscription = this.#documentTypeService
      .create(body as CreateDocumentTypeModel)
      .subscribe({
        next: (response) => {
          if (response.isValid) {
            this.#globalNotification.openAlert(response);
            this.callback(response.data);
            this.onClose();
            this.isLoading.set(false);
          } else {
            this.#globalNotification.openAlert(response);
            this.isLoading.set(false);
          }
        },
        error: (error) => {
          this.#globalNotification.openAlert(error.error);
          this.isLoading.set(false);
        },
      });
    this.subscriptions.push(subscription);
  }

  update() {
    const subscription = this.#documentTypeService
      .update(this.form.value as UpdateDocumentTypeModel)
      .subscribe({
        next: (response) => {
          if (response.isValid) {
            this.#globalNotification.openAlert(response);
            this.callback(response.data);
            this.onClose();
            this.isLoading.set(false);
          } else {
            this.#globalNotification.openAlert(response);
            this.isLoading.set(false);
          }
        },
        error: (error) => {
          this.#globalNotification.openAlert(error.error);
          this.isLoading.set(false);
        },
      });
    this.subscriptions.push(subscription);
  }
}

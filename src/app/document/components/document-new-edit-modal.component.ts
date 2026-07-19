import { Component, Inject, inject, OnInit, signal, ViewContainerRef } from '@angular/core';
import { BaseComponent } from '../../shared/base/base.component';
import { TypedFormGroup } from '../../shared/types/types-form';
import { DocumentService } from '../core/services/document.service';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MODULES } from '../../core/config/permissions/modules';
import {
  CardComponent,
  CardBodyComponent,
  ModalBodyComponent,
  ModalComponent,
  RowComponent,
  ColComponent,
  ButtonDirective,
  SpinnerComponent,
} from '@coreui/angular';
import { IconDirective } from '@coreui/icons-angular';
import { DocumentForm } from '../core/types';
import { buildDocumentForm, documentErrorMessages, documentStructure } from '../helpers';
import { CreateDocument } from '../core/models/create-document.model';
import { GlobalNotification } from '@shared/alerts/global-notification/global-notification';
import { UpdateDocument } from '../core/models/update-document.model';
import { ValidationMessagesComponent } from '@shared/components/error-messages/validation-messages.component';

@Component({
  selector: 'app-document-new-edit-modal',
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
  templateUrl: './document-new-edit-modal.component.html',
})
export class DocumentNewEditModalComponent extends BaseComponent implements OnInit {
  form!: TypedFormGroup<DocumentForm>;
  visible = signal<boolean>(false);
  structure = documentStructure;
  isLoading = signal(false);
  readonly #documentService = inject(DocumentService);
  readonly #formBuilder = inject(FormBuilder);
  readonly #globalNotification = inject(GlobalNotification);
  title = signal('');
  callback: any;
  messages = documentErrorMessages();
  constructor(@Inject(ViewContainerRef) viewContainerRef: ViewContainerRef) {
    super(MODULES.CURRENCY, viewContainerRef);
  }

  ngOnInit(): void {
    this.createForm();
  }

  createForm() {
    this.form = this.#formBuilder.group(buildDocumentForm());
  }

  openModal(idDocument?: number, callback: any = null) {
    this.title.set('Crear Documento');
    this.createForm();
    this.visible.set(true);
    this.callback = callback;
    if (idDocument) {
      this.title.set('Editar Documento');
      this.loadData(idDocument);
    }
  }

  loadData(idDocument: number) {
    this.#documentService.getById(idDocument).subscribe({
      next: (response) => {
        if (response.isValid) {
          this.form.patchValue(response.data);
        }
      },
    });
  }

  onClose() {
    this.visible.set(false);
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
    const subscription = this.#documentService.create(body as CreateDocument).subscribe({
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
    const subscription = this.#documentService
      .update(this.form.value as UpdateDocument)
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

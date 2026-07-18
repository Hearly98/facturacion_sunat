import { Component, Inject, inject, OnInit, signal, ViewContainerRef } from '@angular/core';
import {
  ButtonDirective,
  CardBodyComponent,
  CardComponent,
  ColComponent,
  FormControlDirective,
  FormSelectDirective,
  ModalBodyComponent,
  ModalComponent,
  RowComponent,
  SpinnerComponent,
} from '@coreui/angular';
import { IconDirective } from '@coreui/icons-angular';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { BaseComponent } from '@shared/base/base.component';
import { GlobalNotification } from '@shared/alerts/global-notification/global-notification';
import { TypedFormGroup } from '@shared/types/types-form';
import { CustomerForm } from '../core/types/customer-form';
import { buildCustomerForm, customerErrorMessages, customerStructure } from '../helpers';
import { CustomerService } from '../core/services/customer.service';
import { MODULES } from 'src/app/core/config/permissions/modules';
import { CreateCustomer, UpdateCustomer } from '../core/models';
import { DocumentType } from 'src/app/document-type/core/models';
import { DocumentTypeService } from 'src/app/document-type/core/services/document-type.service';
import { ValidationMessagesComponent } from '@shared/components/error-messages/validation-messages.component';

@Component({
  selector: 'app-customer-new-edit-modal',
  imports: [
    CardComponent,
    CardBodyComponent,
    ModalBodyComponent,
    ModalComponent,
    RowComponent,
    ColComponent,
    ButtonDirective,
    FormSelectDirective,
    FormControlDirective,
    IconDirective,
    ReactiveFormsModule,
    SpinnerComponent,
    ValidationMessagesComponent,
  ],
  templateUrl: './customer-new-edit-modal.component.html',
})
export class CustomerNewEditModalComponent extends BaseComponent implements OnInit {
  form!: TypedFormGroup<CustomerForm>;
  visible = false;
  structure = customerStructure;
  documentTypes: DocumentType[] = [];
  readonly #documentTypeService = inject(DocumentTypeService);
  readonly #globalNotification = inject(GlobalNotification);
  readonly #customerService = inject(CustomerService);
  readonly #formBuilder = inject(FormBuilder);
  title = signal('');
  callback: any;
  messages = customerErrorMessages();
  isLoading = signal(false);
  constructor(@Inject(ViewContainerRef) viewContainerRef: ViewContainerRef) {
    super(MODULES.CUSTOMER, viewContainerRef);
  }

  ngOnInit(): void {
    this.createForm();
    this.documentTypeSelectCombo();
  }

  createForm() {
    this.form = this.#formBuilder.group(buildCustomerForm());
  }

  openModal(idCustomer?: number, callback: any = null) {
    this.title.set('Crear Cliente');
    this.createForm();
    this.visible = true;
    this.callback = callback;
    if (idCustomer) {
      this.title.set('Editar Cliente');
      this.loadData(idCustomer);
    }
  }

  loadData(idCustomer: number) {
    this.#customerService.getById(idCustomer).subscribe({
      next: (response) => {
        if (response.isValid) {
          this.form.patchValue(response.data);
        }
      },
    });
  }

  documentTypeSelectCombo() {
    this.fetchData(this.#documentTypeService.getAll(), this.documentTypes);
  }

  onClose() {
    this.visible = false;
  }

  onSubmit() {
    if (this.form.valid) {
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
    this.isLoading.set(true);
    const { id, ...body } = this.form.value;
    const subscription = this.#customerService.create(body as CreateCustomer).subscribe({
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
    this.isLoading.set(true);
    const subscription = this.#customerService
      .update(this.form.value as UpdateCustomer)
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

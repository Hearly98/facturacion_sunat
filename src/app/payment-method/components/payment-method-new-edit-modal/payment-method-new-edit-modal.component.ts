import { Component, Inject, inject, signal, ViewContainerRef } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
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
import { BaseComponent } from '@shared/base/base.component';
import { TypedFormGroup } from '@shared/types/types-form';
import { PaymentMethodForm } from '../../core/types';
import {
  buildPaymentMethodForm,
  paymentMethodErrorMessages,
  paymentMethodStructure,
} from '../../helpers';
import { GlobalNotification } from '@shared/alerts/global-notification/global-notification';
import { PaymentMethodService } from '../../core/services/payment-method.service';
import { MODULES } from 'src/app/core/config/permissions/modules';
import { CreatePaymentMethod, UpdatePaymentMethod } from '../../core/models';
import { ValidationMessagesComponent } from '@shared/components/error-messages/validation-messages.component';

@Component({
  selector: 'app-payment-method-new-edit-modal',
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
    SpinnerComponent,
    ValidationMessagesComponent,
  ],
  templateUrl: './payment-method-new-edit-modal.component.html',
  styles: ``,
})
export class PaymentMethodNewEditModalComponent extends BaseComponent {
  form!: TypedFormGroup<PaymentMethodForm>;
  visible = false;
  structure = paymentMethodStructure;
  #globalNotification = inject(GlobalNotification);
  #paymentMethodService = inject(PaymentMethodService);
  #formBuilder = inject(FormBuilder);
  title = signal('');
  callback: any;
  isLoading = signal(false);
  messages = paymentMethodErrorMessages();

  constructor(@Inject(ViewContainerRef) viewContainerRef: ViewContainerRef) {
    super(MODULES.PAYMENT_METHOD, viewContainerRef);
  }

  ngOnInit(): void {
    this.createForm();
  }

  createForm() {
    this.form = this.#formBuilder.group(buildPaymentMethodForm());
  }

  openModal(idCategory?: number, callback: any = null) {
    this.title.set('Crear Método Pago');
    this.createForm();
    this.visible = true;
    this.callback = callback;
    if (idCategory) {
      this.title.set('Editar Método Pago');
      this.loadData(idCategory);
    }
  }

  loadData(idCategory: number) {
    this.#paymentMethodService.getById(idCategory).subscribe({
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
    const subscription = this.#paymentMethodService
      .create(body as CreatePaymentMethod)
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
    const subscription = this.#paymentMethodService
      .update(this.form.value as UpdatePaymentMethod)
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

import { Component, Inject, inject, OnInit, signal, ViewContainerRef } from '@angular/core';
import { BaseComponent } from '../../shared/base/base.component';
import { TypedFormGroup } from '../../shared/types/types-form';
import { CurrencyForm } from '../core/types';
import { buildCurrencyForm, currencyErrorMessages, currencyStructure } from '../helpers';
import { CurrencyService } from '../core/services/currency.service';
import { CreateCurrency, UpdateCurrency } from '../core/models';
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
import { GlobalNotification } from '../../shared/alerts/global-notification/global-notification';
import { ValidationMessagesComponent } from '@shared/components/error-messages/validation-messages.component';

@Component({
  selector: 'app-currency-new-edit-modal',
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
  templateUrl: './currency-new-edit-modal.component.html',
})
export class CurrencyNewEditModalComponent extends BaseComponent implements OnInit {
  form!: TypedFormGroup<CurrencyForm>;
  visible = false;
  structure = currencyStructure;
  readonly #currencyService = inject(CurrencyService);
  readonly #globalNotification = inject(GlobalNotification);
  readonly #formBuilder = inject(FormBuilder);
  title = signal('');
  callback: any;
  messages = currencyErrorMessages();
  isLoading = signal(false);

  constructor(@Inject(ViewContainerRef) viewContainerRef: ViewContainerRef) {
    super(MODULES.CURRENCY, viewContainerRef);
  }

  ngOnInit(): void {
    this.createForm();
  }

  createForm() {
    this.form = this.#formBuilder.group(buildCurrencyForm());
  }

  openModal(idCurrency?: number, callback: any = null) {
    this.title.set('Crear Moneda');
    this.createForm();
    this.callback = callback;
    this.visible = true;
    if (idCurrency) {
      this.title.set('Editar Moneda');
      this.loadData(idCurrency);
    }
  }

  loadData(idCurrency: number) {
    this.#currencyService.getById(idCurrency).subscribe({
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
    const subscription = this.#currencyService.create(body as CreateCurrency).subscribe({
      next: (response) => {
        this.#globalNotification.openAlert(response);
        this.isLoading.set(false);
        if (response.isValid) {
          this.callback(response.data);
          this.onClose();
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
    const subscription = this.#currencyService
      .update(this.form.value as UpdateCurrency)
      .subscribe({
        next: (response) => {
          this.#globalNotification.openAlert(response);
          this.isLoading.set(false);
          if (response.isValid) {
            this.callback(response.data);
            this.onClose();
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

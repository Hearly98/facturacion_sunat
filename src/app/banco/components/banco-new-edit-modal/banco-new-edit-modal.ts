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
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { IconDirective } from '@coreui/icons-angular';
import { BancoService } from '../../core/services/banco.service';
import { buildBancoForm, bancoErrorMessages } from '../../helpers';
import { TypedFormGroup } from '@shared/types/types-form';
import { BancoForm } from '../../core/types';
import { CreateBanco, UpdateBanco } from '../../core/models';
import { BaseComponent } from '@shared/base/base.component';
import { MODULES } from 'src/app/core/config/permissions/modules';
import { GlobalNotification } from '@shared/alerts/global-notification/global-notification';
import { ValidationMessagesComponent } from '@shared/components/error-messages/validation-messages.component';
import { CurrencyService } from 'src/app/currency/core/services/currency.service';
import { Currency } from 'src/app/currency/core/models/currency.model';

@Component({
  selector: 'app-banco-new-edit-modal',
  standalone: true,
  imports: [
    CardComponent,
    CardBodyComponent,
    ModalComponent,
    ModalBodyComponent,
    RowComponent,
    ColComponent,
    ButtonDirective,
    CommonModule,
    ReactiveFormsModule,
    IconDirective,
    SpinnerComponent,
    ValidationMessagesComponent,
  ],
  templateUrl: './banco-new-edit-modal.html',
})
export class BancoNewEditModal extends BaseComponent implements OnInit {
  form!: TypedFormGroup<BancoForm>;
  visible = false;
  title = signal('');
  isLoading = signal(false);
  messages = bancoErrorMessages;
  currencies: Currency[] = [];
  callback: (() => void) | null = null;

  readonly #globalNotification = inject(GlobalNotification);
  readonly #bancoService = inject(BancoService);
  readonly #currencyService = inject(CurrencyService);
  readonly #formBuilder = inject(FormBuilder);

  constructor(@Inject(ViewContainerRef) viewContainerRef: ViewContainerRef) {
    super(MODULES.BANCO, viewContainerRef);
  }

  ngOnInit(): void {
    this.createForm();
    this.loadSelectCombos();
  }

  createForm(): void {
    this.form = buildBancoForm(this.#formBuilder) as TypedFormGroup<BancoForm>;
  }

  loadSelectCombos(): void {
    this.fetchData(this.#currencyService.getAll(), this.currencies);
  }

  openModal(id?: number, callback: (() => void) | null = null): void {
    this.title.set('Crear Banco');
    this.createForm();
    this.visible = true;
    this.callback = callback;

    if (id) {
      this.title.set('Editar Banco');
      this.loadData(id);
    }
  }

  loadData(id: number): void {
    const subscription = this.#bancoService.getById(id).subscribe({
      next: (response) => {
        if (response.isValid) {
          this.form.patchValue({
            id: response.data.id,
            name: response.data.name,
            accountNumber: response.data.accountNumber,
            accountType: response.data.accountType,
            currencyId: response.data.currencyId,
          });
        }
      },
    });
    this.subscriptions.push(subscription);
  }

  onClose(): void {
    this.visible = false;
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);

    if (this.form.value.id) {
      this.update();
    } else {
      this.create();
    }
  }

  create(): void {
    const subscription = this.#bancoService.create(this.form.value as CreateBanco).subscribe({
      next: (response) => {
        this.#globalNotification.openAlert(response);
        this.isLoading.set(false);
        if (response.isValid) {
          this.callback?.();
          this.onClose();
        }
      },
      error: (error) => {
        this.#globalNotification.openToastAlert('Error', error.message, 'danger');
        this.isLoading.set(false);
      },
    });
    this.subscriptions.push(subscription);
  }

  update(): void {
    const value = this.form.getRawValue();
    const subscription = this.#bancoService.update(value as UpdateBanco).subscribe({
      next: (response) => {
        this.#globalNotification.openAlert(response);
        this.isLoading.set(false);
        if (response.isValid) {
          this.callback?.();
          this.onClose();
        }
      },
      error: (error) => {
        this.#globalNotification.openToastAlert('Error', error.message, 'danger');
        this.isLoading.set(false);
      },
    });
    this.subscriptions.push(subscription);
  }
}

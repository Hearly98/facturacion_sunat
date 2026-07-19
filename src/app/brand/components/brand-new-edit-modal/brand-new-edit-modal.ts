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
import { BrandService } from '../../core/services/brand.service';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { buildBrandForm, brandStructure, brandErrorMessages } from '../../helpers';
import { TypedFormGroup } from '../../../shared/types/types-form';
import { BrandForm } from '../../core/types';
import { BaseComponent } from '../../../shared/base/base.component';
import { MODULES } from '../../../core/config/permissions/modules';
import { GlobalNotification } from '../../../shared/alerts/global-notification/global-notification';
import { CommonModule } from '@angular/common';
import { ValidationMessagesComponent } from '@shared/components/error-messages/validation-messages.component';
import { IconDirective } from '@coreui/icons-angular';
import { CreateBrand, UpdateBrand } from '../../core/models';
@Component({
  selector: 'app-brand-new-edit-modal',
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
  templateUrl: './brand-new-edit-modal.html',
})
export class BrandNewEditModal extends BaseComponent implements OnInit {
  form!: TypedFormGroup<BrandForm>;
  visible = false;
  structure = brandStructure;
  readonly #globalNotification = inject(GlobalNotification);
  readonly #brandService = inject(BrandService);
  readonly #formBuilder = inject(FormBuilder);
  title = signal('');
  isLoading = signal(false);
  callback: any;
  messages = brandErrorMessages;

  constructor(@Inject(ViewContainerRef) viewContainerRef: ViewContainerRef) {
    super(MODULES.MARCA, viewContainerRef);
  }

  ngOnInit(): void {
    this.createForm();
  }

  createForm() {
    this.form = buildBrandForm(this.#formBuilder) as TypedFormGroup<BrandForm>;
  }

  openModal(idBrand?: number, callback: any = null) {
    this.title.set('Crear Marca');
    this.createForm();
    this.visible = true;
    this.callback = callback;
    if (idBrand) {
      this.title.set('Editar Marca');
      this.loadData(idBrand);
    }
  }

  loadData(idBrand: number) {
    this.#brandService.getById(idBrand).subscribe({
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
    const subscription = this.#brandService.create(this.form.value as CreateBrand).subscribe({
      next: (response) => {
        this.#globalNotification.openAlert(response);
        this.isLoading.set(false);
        if (response.isValid) {
          this.callback(response.data);
          this.onClose();
        }
      },
      error: (error) => {
        this.#globalNotification.openAlert(error.message);
        this.isLoading.set(false);
      },
    });
    this.subscriptions.push(subscription);
  }

  update() {
    const value = this.form.getRawValue();
    const subscription = this.#brandService.update(value as UpdateBrand).subscribe({
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

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
import { BaseComponent } from '../../../shared/base/base.component';
import { MODULES } from '../../../core/config/permissions/modules';
import { SucursalForm } from '../../core/types';
import { SucursalService } from '../../core/services/sucursal.service';
import { buildSucursalForm, sucursalErrorMessages, SucursalStructure } from '../../helpers';
import { CreateSucursal, UpdateSucursal } from '../../core/models';
import { GlobalNotification } from '../../../shared/alerts/global-notification/global-notification';
import { ValidationMessagesComponent } from '@shared/components/error-messages/validation-messages.component';

@Component({
  selector: 'app-sucursal-new-edit-modal',
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
  templateUrl: './sucursal-new-edit-modal.html',
  styleUrl: './sucursal-new-edit-modal.scss',
})
export class SucursalNewEditModal extends BaseComponent implements OnInit {
  form!: TypedFormGroup<SucursalForm>;
  visible = false;
  structure = SucursalStructure;
  #sucursalService = inject(SucursalService);
  #globalNotification = inject(GlobalNotification);
  #formBuilder = inject(FormBuilder);
  title = signal('');
  isLoading = signal(false);
  callback: any;
  messages = sucursalErrorMessages();
  constructor(@Inject(ViewContainerRef) viewContainerRef: ViewContainerRef) {
    super(MODULES.SUCURSAL, viewContainerRef);
  }

  ngOnInit(): void {
    this.createForm();
  }

  createForm() {
    this.form = this.#formBuilder.group(buildSucursalForm());
  }

  openModal(idSucursal?: number, callback: any = null) {
    this.title.set('Crear Sucursal');
    this.createForm();
    this.callback = callback;
    this.visible = true;
    if (idSucursal) {
      this.title.set('Editar Sucursal');
      this.loadData(idSucursal);
    }
  }

  loadData(idSucursal: number) {
    this.#sucursalService.getById(idSucursal).subscribe({
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
    const { id, companyId, ...body } = this.form.value;
    const subscription = this.#sucursalService.create(body as CreateSucursal).subscribe({
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
    const { id, companyId, ...body } = this.form.value;
    const subscription = this.#sucursalService
      .update(id!, { id: id!, ...body } as UpdateSucursal)
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

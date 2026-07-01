import { Component, Inject, inject, OnInit, signal, ViewContainerRef } from '@angular/core';
import {
  ButtonDirective,
  CardBodyComponent,
  CardComponent,
  ColComponent,
  ModalBodyComponent,
  ModalComponent,
  RowComponent,
} from '@coreui/angular';
import { RolService } from '../../core/services/rol.service';
import { IconDirective } from '@coreui/icons-angular';
import { buildRolForm, rolErrorMessages, rolStructure } from '../../helpers';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { TypedFormGroup } from '../../../shared/types/types-form';
import { RolForm } from '../../core/types/rol-form';
import { BaseComponent } from '../../../shared/base/base.component';
import { MODULES } from '../../../core/config/permissions/modules';
import { CreateRolModel, UpdateRolModel } from '../../core/models';
import { GlobalNotification } from '../../../shared/alerts/global-notification/global-notification';
import { GetSucursalModel } from '../../../sucursal/core/models';
import { ValidationMessagesComponent } from '@shared/components/error-messages/validation-messages.component';

@Component({
  selector: 'app-rol-new-edit-modal',
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
  ],
  templateUrl: './rol-new-edit-modal.html',
  styleUrl: './rol-new-edit-modal.scss',
})
export class RolNewEditModal extends BaseComponent implements OnInit {
  form!: TypedFormGroup<RolForm>;
  visible = false;
  structure = rolStructure;
  sucursales: GetSucursalModel[] = [];
  messages = rolErrorMessages();
  isLoading = signal(false);
  readonly #globalNotification = inject(GlobalNotification);
  readonly #rolService = inject(RolService);
  readonly #formBuilder = inject(FormBuilder);
  title = signal('');
  callback: any;

  constructor(@Inject(ViewContainerRef) viewContainerRef: ViewContainerRef) {
    super(MODULES.ROL, viewContainerRef);
  }

  ngOnInit(): void {
    this.createForm();
  }

  createForm() {
    this.form = this.#formBuilder.group(buildRolForm());
  }

  openModal(idRol?: number, callback: any = null) {
    this.title.set('Crear Rol');
    this.createForm();
    this.visible = true;
    this.callback = callback;
    if (idRol) {
      this.title.set('Editar Rol');
      this.loadData(idRol);
    }
  }

  loadData(idRol: number) {
    this.#rolService.getById(idRol).subscribe({
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
    const subscription = this.#rolService.create(body as CreateRolModel).subscribe({
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
        this.#globalNotification.openAlert(error.message);
        this.isLoading.set(false);
      },
    });
    this.subscriptions.push(subscription);
  }

  update() {
    this.isLoading.set(true);
    const subscription = this.#rolService.update(this.form.value as UpdateRolModel).subscribe({
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
        this.#globalNotification.openAlert(error.message);
        this.isLoading.set(false);
      },
    });
    this.subscriptions.push(subscription);
  }
}

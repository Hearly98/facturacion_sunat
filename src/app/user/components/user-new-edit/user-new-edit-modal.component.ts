import { Component, Inject, inject, OnInit, signal, ViewContainerRef } from '@angular/core';
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
import { GlobalNotification } from '@shared/alerts/global-notification/global-notification';
import { BaseComponent } from '@shared/base/base.component';
import { TypedFormGroup } from '@shared/types/types-form';
import { UserForm } from '../../core/types';
import { MODULES } from 'src/app/core/config/permissions/modules';
import { buildUserForm, userStructure, userValidationMessage } from '../../helpers';
import { CreateUser, UpdateUser } from '../../core/models';
import { UserService } from '../../core/services/user.service';
import { Rol } from 'src/app/rol/core/models';
import { RolService } from 'src/app/rol/core/services/rol.service';
import { ValidationMessagesComponent } from '@shared/components/error-messages/validation-messages.component';

@Component({
  selector: 'app-user-new-edit-modal',
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
  templateUrl: './user-new-edit-modal.component.html',
})
export class UserNewEditModalComponent extends BaseComponent implements OnInit {
  form!: TypedFormGroup<UserForm>;
  visible = signal<boolean>(false);
  structure = userStructure;
  roles: Rol[] = [];
  isLoading = signal(false);
  errorMessages = userValidationMessage;
  readonly #rolService = inject(RolService);
  readonly #userService = inject(UserService);
  readonly #globalNotification = inject(GlobalNotification);
  readonly #formBuilder = inject(FormBuilder);
  title = signal<string>('Crear Usuario');
  callback: any;

  constructor(@Inject(ViewContainerRef) viewContainerRef: ViewContainerRef) {
    super(MODULES.USERS, viewContainerRef);
  }

  ngOnInit(): void {
    this.createForm();
    this.rolSelectCombo();
  }

  createForm() {
    this.form = this.#formBuilder.group(buildUserForm());
  }

  openModal(idUser?: number, callback: any = null) {
    this.createForm();
    this.visible.set(true);
    this.callback = callback;
    if (idUser) {
      this.title.set('Editar Usuario');
      this.loadData(idUser);
    }
  }

  loadData(idUser: number) {
    this.#userService.getById(idUser).subscribe({
      next: (response) => {
        if (response.isValid) {
          this.form.patchValue(response.data);
        }
      },
    });
  }

  rolSelectCombo() {
    this.fetchData(this.#rolService.getAll(), this.roles);
  }

  onClose() {
    this.visible.set(false);
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
    const subscription = this.#userService.create(body as CreateUser).subscribe({
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
    const subscription = this.#userService.update(this.form.value as UpdateUser).subscribe({
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

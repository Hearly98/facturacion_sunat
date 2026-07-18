import { Component, Inject, inject, signal, ViewContainerRef } from '@angular/core';
import { BaseComponent } from '@shared/base/base.component';
import { UnitOfMeasureService } from '../../core/services/unit-of-measure.service';
import { MODULES } from 'src/app/core/config/permissions/modules';
import { GlobalNotification } from '@shared/alerts/global-notification/global-notification';
import { TypedFormGroup } from '@shared/types/types-form';
import { UnitOfMeasureForm } from '../../core/types';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import {
  buildUnitOfMeasureForm,
  unitOfMeasureErrorMessages,
  unitOfMeasureStructure,
} from '../../helpers';
import {
  ButtonModule,
  CardBodyComponent,
  CardComponent,
  ColComponent,
  ModalBodyComponent,
  ModalComponent,
  RowComponent,
  SpinnerComponent,
} from '@coreui/angular';
import { IconDirective } from '@coreui/icons-angular';
import { CreateUnitOfMeasure, UpdateUnitOfMeasure } from '../../core/models';
import { GetSucursalModel } from 'src/app/sucursal/core/models';
import { ValidationMessagesComponent } from '@shared/components/error-messages/validation-messages.component';

@Component({
  selector: 'app-unit-of-measure-new-edit-modal',
  standalone: true,
  imports: [
    ModalComponent,
    ReactiveFormsModule,
    IconDirective,
    RowComponent,
    ColComponent,
    CardComponent,
    ModalBodyComponent,
    ButtonModule,
    CardBodyComponent,
    ValidationMessagesComponent,
    SpinnerComponent
  ],
  templateUrl: './unit-of-measure-new-edit-modal.component.html',
})
export class UnitOfMeasureNewEditModalComponent extends BaseComponent {
  visible = signal<boolean>(false);
  title = signal<string>('');
  callback: any;
  isLoading = signal(false);
  messages = unitOfMeasureErrorMessages();
  structure = unitOfMeasureStructure;
  form!: TypedFormGroup<UnitOfMeasureForm>;
  sucursales: GetSucursalModel[] = [];
  readonly #globalNotification = inject(GlobalNotification);
  readonly #formBuilder = inject(FormBuilder);
  readonly #unitOfMeasureService = inject(UnitOfMeasureService);
  constructor(@Inject(ViewContainerRef) viewContainerRef: ViewContainerRef) {
    super(MODULES.UNIT_OF_MEASURE, viewContainerRef);
    this.createForm();
  }

  createForm() {
    this.form = this.#formBuilder.group(buildUnitOfMeasureForm());
  }

  openModal(id?: number, callback?: () => void) {
    this.title.set('Crear Unidad de Medida');
    this.createForm();
    this.visible.set(true);
    if (id) {
      this.title.set('Editar Unidad de Medida');
      this.form.patchValue({ id: id });
      this.loadData(id);
    }
    this.callback = callback;
  }

  loadData(id: number) {
    this.#unitOfMeasureService.getById(id).subscribe({
      next: (response) => {
        if (response.isValid) {
          this.form.patchValue(response.data);
        } else {
          this.#globalNotification.openAlert(response);
        }
      },
      error: (error) => {
        this.#globalNotification.openAlert(error.error);
      },
    });
  }

  onClose() {
    this.visible.set(false);
  }

  onSubmit() {
    if (this.form.valid) {
      if (this.form.value.id) {
        this.isLoading.set(true);
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
    const subscription = this.#unitOfMeasureService
      .create(body as CreateUnitOfMeasure)
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
    this.isLoading.set(true);
    const subscription = this.#unitOfMeasureService
      .update(this.form.value as UpdateUnitOfMeasure)
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

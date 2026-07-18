import { Component, Inject, inject, OnInit, signal, ViewContainerRef } from '@angular/core';
import {
  ButtonDirective,
  ModalBodyComponent,
  ModalComponent,
  RowComponent,
  ColComponent,
  SpinnerComponent,
  CardComponent,
  CardBodyComponent,
} from '@coreui/angular';
import { IconDirective } from '@coreui/icons-angular';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { TypedFormGroup } from '../../../shared/types/types-form';
import { BaseComponent } from '../../../shared/base/base.component';
import { MODULES } from '../../../core/config/permissions/modules';
import { AlmacenForm } from '../../core/types';
import { AlmacenService } from '../../core/services/almacen.service';
import { buildAlmacenForm, AlmacenStructure, almacenErrorMessages } from '../../helpers';
import { CreateAlmacenModel, UpdateAlmacenModel } from '../../core/models';
import { GlobalNotification } from '../../../shared/alerts/global-notification/global-notification';
import { SucursalService } from '../../../sucursal/core/services/sucursal.service';
import { Sucursal } from '../../../sucursal/core/models';
import { CommonModule } from '@angular/common';
import { ValidationMessagesComponent } from '@shared/components/error-messages/validation-messages.component';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-almacen-modal-new-edit',
  standalone: true,
  imports: [
    CommonModule,
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
  templateUrl: './almacen-modal-new-edit.html',
})
export class AlmacenModalNewEdit extends BaseComponent implements OnInit {
  form!: TypedFormGroup<AlmacenForm>;
  visible = false;
  structure = AlmacenStructure();
  messages = almacenErrorMessages();
  readonly #almacenService = inject(AlmacenService);
  readonly #sucursalService = inject(SucursalService);
  readonly #globalNotification = inject(GlobalNotification);
  readonly #formBuilder = inject(FormBuilder);
  title = signal('');
  isLoading = signal(false);
  callback: any;
  sucursales: Sucursal[] = [];

  constructor(@Inject(ViewContainerRef) viewContainerRef: ViewContainerRef) {
    super(MODULES.ALMACEN, viewContainerRef);
  }

  ngOnInit(): void {
    forkJoin({
      sucursales: this.#sucursalService.getAll(),
    }).subscribe((response) => {
      const sucursales = response.sucursales.data;
      this.structure = AlmacenStructure(sucursales);
      this.createForm();
    });
  }
  createForm() {
    this.form = this.#formBuilder.group(buildAlmacenForm());
  }

  openModal(idAlmacen?: number, callback: any = null) {
    this.title.set('Crear Almacén');
    this.createForm();
    this.callback = callback;
    this.visible = true;
    if (idAlmacen) {
      this.title.set('Editar Almacén');
      this.loadData(idAlmacen);
    }
  }

  loadData(idAlmacen: number) {
    this.#almacenService.getById(idAlmacen).subscribe({
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
    const subscription = this.#almacenService.create(body as CreateAlmacenModel).subscribe({
      next: (response) => {
        if (response.isValid) {
          this.#globalNotification.openAlert(response);
          if (this.callback) this.callback(response.data);
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
    const subscription = this.#almacenService
      .update(this.form.value as UpdateAlmacenModel, this.form.value.id as number)
      .subscribe({
        next: (response) => {
          if (response.isValid) {
            this.#globalNotification.openAlert(response);
            if (this.callback) this.callback(response.data);
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

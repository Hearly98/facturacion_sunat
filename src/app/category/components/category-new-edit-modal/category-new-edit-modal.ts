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
import { CategoryService } from '../../core/services/category.service';
import { IconDirective } from '@coreui/icons-angular';
import { buildCategoryForm, categoryErrorMessages, categoryStructure } from '../../helpers';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { TypedFormGroup } from '../../../shared/types/types-form';
import { CategoryForm } from '../../core/types/cat-form';
import { BaseComponent } from '../../../shared/base/base.component';
import { MODULES } from '../../../core/config/permissions/modules';
import { CreateCategoryModel, UpdateCategoryModel } from '../../core/models';
import { GlobalNotification } from '../../../shared/alerts/global-notification/global-notification';
import { ValidationMessagesComponent } from '@shared/components/error-messages/validation-messages.component';

@Component({
  selector: 'app-category-new-edit-modal',
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
  templateUrl: './category-new-edit-modal.html',
})
export class CategoryNewEditModal extends BaseComponent implements OnInit {
  form!: TypedFormGroup<CategoryForm>;
  visible = false;
  structure = categoryStructure;
  readonly messages = categoryErrorMessages();
  readonly #globalNotification = inject(GlobalNotification);
  readonly #categoryService = inject(CategoryService);
  readonly #formBuilder = inject(FormBuilder);
  title = signal('');
  isLoading = signal(false);
  callback: any;

  constructor(@Inject(ViewContainerRef) viewContainerRef: ViewContainerRef) {
    super(MODULES.MARCA, viewContainerRef);
  }

  ngOnInit(): void {
    this.createForm();
  }

  createForm() {
    this.form = this.#formBuilder.group(buildCategoryForm());
  }

  openModal(idCategory?: number, callback: any = null) {
    this.title.set('Crear Categoria');
    this.createForm();
    this.visible = true;
    this.callback = callback;
    if (idCategory) {
      this.title.set('Editar Categoría');
      this.loadData(idCategory);
    }
  }

  loadData(idCategory: number) {
    this.#categoryService.getById(idCategory).subscribe({
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
    const subscription = this.#categoryService.create(body as CreateCategoryModel).subscribe({
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
    const subscription = this.#categoryService
      .update(this.form.value as UpdateCategoryModel)
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

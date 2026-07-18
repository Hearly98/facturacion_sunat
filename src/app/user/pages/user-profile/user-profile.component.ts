import { Component, Inject, OnInit, ViewContainerRef, inject, signal } from '@angular/core';
import {
  RowComponent,
  ColComponent,
  CardComponent,
  CardBodyComponent,
  CardHeaderComponent,
  AvatarComponent,
} from '@coreui/angular';
import { IconDirective } from '@coreui/icons-angular';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { BaseComponent } from '../../../shared/base/base.component';
import { MODULES } from '../../../core/config/permissions/modules';
import { buildUserForm } from '../../helpers';
import { UserService } from '../../core/services/user.service';
import { GlobalNotification } from '../../../shared/alerts/global-notification/global-notification';
import { ImageCompressionService } from '../../../shared/services/image-compression.service';
import { User } from '../../core/models';
import { ButtonDirective } from '@coreui/angular';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [
    RowComponent,
    ColComponent,
    CardComponent,
    CardBodyComponent,
    CardHeaderComponent,
    IconDirective,
    ReactiveFormsModule,
    ButtonDirective,
    AvatarComponent,
  ],
  template: `
    <c-row class="mb-4">
      <c-col>
        <h4>Mi Perfil</h4>
        <p class="text-muted small">Actualiza tu información personal</p>
      </c-col>
    </c-row>

    <c-card>
      <c-card-header>
        <strong>Información Personal</strong>
      </c-card-header>
      <c-card-body [formGroup]="form">
        <c-row>
          <c-col [md]="6">
            <c-card class="h-100">
              <c-card-body class="d-flex flex-column align-items-center justify-content-center py-4">
                <div class="text-center mb-3">
                  @if (imagePreview()) {
                    <img
                      [src]="imagePreview()"
                      alt="Foto de Perfil"
                      class="rounded-circle shadow-sm mb-3"
                      style="width: 150px; height: 150px; object-fit: cover;"
                    />
                  } @else {
                    <c-avatar color="primary" status="success" size="xl">CUI</c-avatar>
                  }
                </div>
                <label
                  class="btn btn-outline-primary btn-sm"
                  [class.disabled]="isCompressing()"
                >
                  <svg cIcon name="cilCloudUpload" class="me-1"></svg>
                  @if (isCompressing()) {
                    <span class="spinner-border spinner-border-sm me-1" role="status"></span>
                    Comprimiendo...
                  } @else {
                    {{ selectedFile ? 'Cambiar Foto' : 'Seleccionar Foto' }}
                  }
                  <input
                    type="file"
                    class="d-none"
                    (change)="onFileChange($event)"
                    accept="image/jpeg,image/png,image/jpg,image/webp"
                    [disabled]="isCompressing()"
                  />
                </label>
                <small class="text-muted mt-2" style="font-size: 0.75rem;">
                  Límite: <strong class="text-primary">50KB</strong> (JPG, PNG, WebP)
                </small>
                @if (selectedFile) {
                  <button
                    (click)="removeImage()"
                    class="btn btn-outline-danger btn-sm mt-2"
                    type="button"
                  >
                    <svg cIcon name="cilTrash" class="me-1"></svg>
                    Eliminar Foto
                  </button>
                }
              </c-card-body>
            </c-card>
          </c-col>

          <c-col [md]="6">
            <c-row class="g-3">
              <c-col [md]="6">
                <label for="" class="form-label">Nombres</label>
                <input
                  class="form-control"
                  type="text"
                  formControlName="firstName"
                  placeholder="Ingrese nombres"
                />
              </c-col>
              <c-col [md]="6">
                <label for="" class="form-label">Apellidos</label>
                <input
                  class="form-control"
                  type="text"
                  formControlName="lastName"
                  placeholder="Ingrese apellidos"
                />
              </c-col>
              <c-col [md]="6">
                <label for="" class="form-label">DNI</label>
                <input
                  class="form-control"
                  type="text"
                  formControlName="dni"
                  placeholder="Ingrese DNI"
                  maxlength="8"
                />
              </c-col>
              <c-col [md]="6">
                <label for="" class="form-label">Teléfono</label>
                <input
                  class="form-control"
                  type="text"
                  formControlName="phone"
                  placeholder="Ingrese teléfono"
                />
              </c-col>
              <c-col [md]="12">
                <label for="" class="form-label">Correo Electrónico</label>
                <input
                  class="form-control"
                  type="email"
                  formControlName="email"
                  placeholder="Ingrese correo"
                />
              </c-col>
            </c-row>
          </c-col>
        </c-row>

        <c-row class="mt-4">
          <c-col class="text-end">
            <button cButton color="secondary" class="me-2" (click)="resetForm()">
              <svg cIcon name="cilX" class="me-1"></svg>
              Cancelar
            </button>
            <button cButton color="success" (click)="onSubmit()">
              <svg cIcon name="cilSave" class="me-1"></svg>
              Guardar Cambios
            </button>
          </c-col>
        </c-row>
      </c-card-body>
    </c-card>
  `,
  styles: ``,
})
export class UserProfileComponent extends BaseComponent implements OnInit {
  form!: FormGroup;
  #formBuilder = inject(FormBuilder);
  selectedFile: File | null = null;
  imagePreview = signal<string | null>(null);
  isCompressing = signal<boolean>(false);
  isLoading = signal<boolean>(true);
  #userService = inject(UserService);
  #globalNotification = inject(GlobalNotification);
  #imageCompressionService = inject(ImageCompressionService);
  originalData: User | null = null;

  constructor(@Inject(ViewContainerRef) viewContainerRef: ViewContainerRef) {
    super(MODULES.USERS, viewContainerRef);
  }

  ngOnInit(): void {
    this.createForm();
    this.loadData();
  }

  createForm() {
    this.form = this.#formBuilder.group(buildUserForm());
  }

  loadData() {
    this.isLoading.set(true);
    const subscription = this.#userService.getMe().subscribe({
      next: (response) => {
        if (response.isValid) {
          this.originalData = response.data;
          this.form.patchValue(response.data);
          this.form.patchValue({ id: response.data.id });
          if (response.data.image) {
            this.imagePreview.set(response.data.image);
          }
        } else {
          this.#globalNotification.openAlert(response);
        }
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error(error);
        this.isLoading.set(false);
        this.#globalNotification.openToastAlert(
          'Error',
          'No se pudo cargar la información del usuario',
          'danger'
        );
      },
    });
    this.subscriptions.push(subscription);
  }

  resetForm() {
    if (this.originalData) {
      this.form.patchValue(this.originalData);
      this.imagePreview.set(this.originalData.image || null);
      this.selectedFile = null;
    }
  }

  async onFileChange(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    if (!this.#imageCompressionService.isValidImageFile(file)) {
      this.#globalNotification.openToastAlert(
        'Tipo de archivo no permitido',
        'Solo se permiten imágenes JPG, PNG o WebP',
        'danger'
      );
      event.target.value = '';
      return;
    }

    const originalSizeKB = file.size / 1024;

    if (file.size <= 50 * 1024) {
      this.processValidFile(file);
      return;
    }

    this.isCompressing.set(true);

    try {
      const result = await this.#imageCompressionService.compressImage(file, 50);

      if (result.success && result.file) {
        const finalSizeKB = result.compressedSize / 1024;

        if (result.compressedSize > 50 * 1024) {
          this.#globalNotification.openToastAlert(
            'Foto demasiado grande',
            `La foto no pudo comprimirse a menos de 50KB. Tamaño final: ${finalSizeKB.toFixed(2)} KB.`,
            'danger'
          );
          event.target.value = '';
          this.isCompressing.set(false);
          return;
        }

        this.#globalNotification.openToastAlert(
          'Foto optimizada',
          `Foto comprimida: ${originalSizeKB.toFixed(0)} KB → ${finalSizeKB.toFixed(2)} KB`,
          'success'
        );

        this.processValidFile(result.file);
      } else {
        throw new Error(result.error || 'Error desconocido en la compresión');
      }
    } catch (error) {
      console.error('Error al comprimir foto:', error);
      this.#globalNotification.openToastAlert(
        'Error de compresión',
        'No se pudo comprimir la foto. Por favor, intenta con otra imagen.',
        'danger'
      );
      event.target.value = '';
    } finally {
      this.isCompressing.set(false);
    }
  }

  private processValidFile(file: File) {
    this.selectedFile = file;
    const reader = new FileReader();
    reader.onload = () => {
      this.imagePreview.set(reader.result as string);
    };
    reader.readAsDataURL(file);
  }

  removeImage() {
    if (this.isCompressing()) return;
    this.selectedFile = null;
    this.imagePreview.set(this.originalData?.image || null);
    this.form.patchValue({ image: null });
  }

  onSubmit() {
    if (this.form.valid) {
      this.update();
    } else {
      this.form.markAllAsTouched();
    }
  }

  update() {
    const formValues = this.form.value;

    const subscription = this.#userService.update(formValues).subscribe({
      next: (response) => {
        if (response.isValid) {
          this.#globalNotification.openAlert(response);
          this.originalData = response.data;
          if (response.data.image) {
            this.imagePreview.set(response.data.image);
          }
          this.selectedFile = null;
        } else {
          this.#globalNotification.openAlert(response);
        }
      },
      error: (error) => {
        this.#globalNotification.openAlert(error.message);
      },
    });
    this.subscriptions.push(subscription);
  }
}

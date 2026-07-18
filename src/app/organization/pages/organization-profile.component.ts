import { Component, Inject, OnInit, ViewContainerRef, inject, signal } from '@angular/core';
import {
  RowComponent,
  ColComponent,
  CardComponent,
  CardBodyComponent,
  CardHeaderComponent,
} from '@coreui/angular';
import { IconDirective } from '@coreui/icons-angular';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { BaseComponent } from '../../shared/base/base.component';
import { MODULES } from '../../core/config/permissions/modules';
import { buildOrganizationForm, organizationStructure } from '../helpers';
import { OrganizationService } from '../core/services/organization.service';
import { GlobalNotification } from '../../shared/alerts/global-notification/global-notification';
import { ImageCompressionService } from '../../shared/services/image-compression.service';
import { GetOrganization } from '../core/models/get-organization.model';
import { ButtonDirective } from '@coreui/angular';

@Component({
  selector: 'app-organization-profile',
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
  ],
  template: `
    <c-row class="mb-4">
      <c-col>
        <h4>Mi Empresa</h4>
        <p class="text-muted small">Actualiza la información de tu empresa</p>
      </c-col>
    </c-row>

    <c-card>
      <c-card-header>
        <strong>Información de la Empresa</strong>
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
                      alt="Logo de la Empresa"
                      class="img-thumbnail shadow-sm mb-3"
                      style="width: 150px; height: 150px; object-fit: contain; background: #f8f9fa; border-radius: 8px;"
                    />
                  } @else {
                    <div
                      class="bg-light d-flex align-items-center justify-content-center mb-3"
                      style="width: 150px; height: 150px; border-radius: 8px; margin: 0 auto;"
                    >
                      <svg cIcon name="cilBuilding" size="4xl" class="text-secondary"></svg>
                    </div>
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
                    {{ selectedFile ? 'Cambiar Logo' : 'Seleccionar Logo' }}
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
                    Eliminar Logo
                  </button>
                }
              </c-card-body>
            </c-card>
          </c-col>

          <c-col [md]="6">
            <c-row class="g-3">
              @for (item of structure; track $index) {
                @if (item.formControlName !== 'emp_logo') {
                  <c-col [md]="item.col || 12">
                    <label for="" class="form-label">{{ item.label }}</label>
                    <input
                      class="form-control"
                      [type]="item.type"
                      [formControlName]="item.formControlName"
                      [placeholder]="'Ingrese ' + item.label"
                    />
                  </c-col>
                }
              }
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
export class OrganizationProfileComponent extends BaseComponent implements OnInit {
  form!: FormGroup;
  #formBuilder = inject(FormBuilder);
  structure = organizationStructure.filter((item) => item.formControlName !== 'logo');
  selectedFile: File | null = null;
  imagePreview = signal<string | null>(null);
  isCompressing = signal<boolean>(false);
  isLoading = signal<boolean>(true);
  #organizationService = inject(OrganizationService);
  #globalNotification = inject(GlobalNotification);
  #imageCompressionService = inject(ImageCompressionService);
  originalData: GetOrganization | null = null;

  constructor(@Inject(ViewContainerRef) viewContainerRef: ViewContainerRef) {
    super(MODULES.ORGANIZATION, viewContainerRef);
  }

  ngOnInit(): void {
    this.createForm();
    this.loadData();
  }

  createForm() {
    this.form = this.#formBuilder.group(buildOrganizationForm());
  }

  loadData() {
    this.isLoading.set(true);
    const subscription = this.#organizationService.getMe().subscribe({
      next: (response) => {
        if (response.isValid) {
          this.originalData = response.data;
          this.form.patchValue(response.data);
          this.form.patchValue({ id: response.data.id });
          if (response.data.logoUrl) {
            this.imagePreview.set(response.data.logoUrl);
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
          'No se pudo cargar la información de la empresa',
          'danger'
        );
      },
    });
    this.subscriptions.push(subscription);
  }

  resetForm() {
    if (this.originalData) {
      this.form.patchValue(this.originalData);
      this.imagePreview.set(this.originalData.logoUrl || null);
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
            'Logo demasiado grande',
            `El logo no pudo comprimirse a menos de 50KB. Tamaño final: ${finalSizeKB.toFixed(2)} KB.`,
            'danger'
          );
          event.target.value = '';
          this.isCompressing.set(false);
          return;
        }

        this.#globalNotification.openToastAlert(
          'Logo optimizado',
          `Logo comprimido: ${originalSizeKB.toFixed(0)} KB → ${finalSizeKB.toFixed(2)} KB`,
          'success'
        );

        this.processValidFile(result.file);
      } else {
        throw new Error(result.error || 'Error desconocido en la compresión');
      }
    } catch (error) {
      console.error('Error al comprimir logo:', error);
      this.#globalNotification.openToastAlert(
        'Error de compresión',
        'No se pudo comprimir el logo. Por favor, intenta con otra imagen.',
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
    this.imagePreview.set(this.originalData?.logoUrl || null);
    this.form.patchValue({ logo: null });
  }

  private buildFormData(): FormData {
    const formData = new FormData();
    const formValues = this.form.value;

    Object.keys(formValues).forEach((key) => {
      if (key !== 'logo' && formValues[key] !== null && formValues[key] !== undefined) {
        formData.append(key, formValues[key]);
      }
    });

    if (this.selectedFile) {
      formData.append('logo', this.selectedFile);
    }

    return formData;
  }

  onSubmit() {
    if (this.form.valid) {
      this.update();
    } else {
      this.form.markAllAsTouched();
    }
  }

  update() {
    const body = this.buildFormData();
    body.append('_method', 'PUT');

    const subscription = this.#organizationService.create(body).subscribe({
      next: (response) => {
        if (response.isValid) {
          this.#globalNotification.openAlert(response);
          this.originalData = response.data;
          if (response.data.logoUrl) {
            this.imagePreview.set(response.data.logoUrl);
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

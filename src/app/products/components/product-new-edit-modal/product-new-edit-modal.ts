import { Component, Inject, inject, OnInit, signal, ViewContainerRef } from '@angular/core';
import {
  ButtonDirective,
  CardBodyComponent,
  CardComponent,
  ColComponent,
  ModalBodyComponent,
  ModalComponent,
  ModalFooterComponent,
  RowComponent,
  SpinnerComponent,
} from '@coreui/angular';
import { ProductService } from '../../core/services/product.service';
import { CreateProduct, UpdateProduct, Product } from '../../core/models';
import { IconDirective } from '@coreui/icons-angular';
import { buildProductForm, productStructure } from '../../helpers';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { BaseComponent } from '../../../shared/base/base.component';
import { MODULES } from '../../../core/config/permissions/modules';
import { GlobalNotification } from '../../../shared/alerts/global-notification/global-notification';
import { CategoryService } from '../../../category/core/services/category.service';
import { CurrencyService } from '../../../currency/core/services/currency.service';
import { UnitOfMeasureService } from '../../../unit-of-measure/core/services/unit-of-measure.service';
import { ImageCompressionService } from '../../../shared/services/image-compression.service';
import { BrandService } from '../../../brand/core/services/brand.service';
import { forkJoin } from 'rxjs';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-product-new-edit-modal',
  imports: [
    CardComponent,
    CardBodyComponent,
    ModalBodyComponent,
    ModalComponent,
    RowComponent,
    ColComponent,
    ButtonDirective,
    IconDirective,
    CommonModule,
    ModalFooterComponent,
    ReactiveFormsModule,
    SpinnerComponent,
  ],
  templateUrl: './product-new-edit-modal.html',
  styleUrl: './product-new-edit-modal.scss',
})
export class ProductNewEditModal extends BaseComponent implements OnInit {
  form!: FormGroup;
  visible = false;
  structure = productStructure();
  selectedFile: File | null = null;
  imagePreview = signal<string | null>(null);
  isCompressing = signal<boolean>(false);
  readonly #categoryService = inject(CategoryService);
  readonly #currencyService = inject(CurrencyService);
  readonly #unidadService = inject(UnitOfMeasureService);
  readonly #brandService = inject(BrandService);
  readonly #globalNotification = inject(GlobalNotification);
  readonly #productService = inject(ProductService);
  readonly #formBuilder = inject(FormBuilder);
  readonly #imageCompressionService = inject(ImageCompressionService);
  title = signal('');
  isLoading = signal(false);
  callback: any;
  isEditMode = false;
  private brandOptions: any[] = [];
  private unitOfMeasureOptions: any[] = [];
  private categoryOptions: any[] = [];
  private currencyOptions: any[] = [];

  constructor(@Inject(ViewContainerRef) viewContainerRef: ViewContainerRef) {
    super(MODULES.PRODUCT, viewContainerRef);
  }

  ngOnInit(): void {
    forkJoin({
      brand: this.#brandService.getAll(),
      currency: this.#currencyService.getAll(),
      unitOfMeasure: this.#unidadService.getAll(),
      category: this.#categoryService.getAll()
    }).subscribe(({brand, currency, unitOfMeasure, category}) => {
      this.brandOptions = brand.data;
      this.unitOfMeasureOptions = unitOfMeasure.data;
      this.categoryOptions = category.data;
      this.currencyOptions = currency.data;
      this.structure = productStructure(brand.data, unitOfMeasure.data, category.data, currency.data);
      this.createForm();
    });
  }

  createForm() {
    this.form = this.#formBuilder.group(buildProductForm(this.isEditMode));
  }

  openModal(idProduct?: number, callback: any = null) {
    this.selectedFile = null;
    this.imagePreview.set(null);
    this.visible = true;
    this.callback = callback;
    this.isEditMode = !!idProduct;
    this.createForm();
    if (this.isEditMode) {
      this.structure = productStructure(
        this.brandOptions, 
        this.unitOfMeasureOptions, 
        this.categoryOptions, 
        this.currencyOptions, 
        true
      );
    }
    if (idProduct) {
      this.title.set('Editar Producto');
      this.loadData(idProduct);
    } else {
      this.title.set('Crear Producto');
    }
  }

  loadData(idProduct: number) {
    this.#productService.getById(idProduct).subscribe({
      next: (response) => {
        if (response.isValid) {
          const productData = response.data;
          this.form.patchValue({
            id: productData.id,
            name: productData.name,
            description: productData.description,
            categoryId: productData.categoryId,
            unitId: productData.unitId,
            currencyId: productData.currencyId,
            brandId: productData.brandId,
            internalCode: productData.internalCode,
            manufacturerCode: productData.manufacturerCode,
            basePurchasePrice: productData.basePurchasePrice,
            baseSalePrice: productData.baseSalePrice,
            weight: productData.weight,
            branchId: productData.branchId,
            warehouses: productData.warehouses,
          });
          if (productData.image) {
            this.imagePreview.set(productData.image);
          }
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
      this.#globalNotification.openToastAlert(
        'Formulario inválido',
        'Por favor, complete todos los campos requeridos',
        'danger',
      );
    }
  }

  private buildCreateProduct(): CreateProduct {
    const formValue = this.form.value;
    return {
      name: formValue.name,
      description: formValue.description,
      categoryId: formValue.categoryId,
      unitId: formValue.unitId,
      currencyId: formValue.currencyId,
      brandId: formValue.brandId,
      internalCode: formValue.internalCode,
      manufacturerCode: formValue.manufacturerCode,
      basePurchasePrice: formValue.basePurchasePrice,
      baseSalePrice: formValue.baseSalePrice,
      weight: formValue.weight,
      branchId: formValue.branchId,
      warehouses: formValue.warehouses || [],
    };
  }

  private buildUpdateProduct(): UpdateProduct {
    const formValue = this.form.value;
    return {
      id: formValue.id,
      name: formValue.name,
      description: formValue.description,
      categoryId: formValue.categoryId,
      unitId: formValue.unitId,
      currencyId: formValue.currencyId,
      brandId: formValue.brandId,
      internalCode: formValue.internalCode,
      manufacturerCode: formValue.manufacturerCode,
      basePurchasePrice: formValue.basePurchasePrice,
      baseSalePrice: formValue.baseSalePrice,
      weight: formValue.weight,
      branchId: formValue.branchId,
      warehouses: formValue.warehouses || [],
    };
  }

  create() {
    const product = this.buildCreateProduct();
    const subscription = this.#productService.createBulk(product, this.selectedFile || undefined).subscribe({
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
    const product = this.buildUpdateProduct();
    const subscription = this.#productService.update(product, this.selectedFile || undefined).subscribe({
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

  async onChange(event: Event) {
    const input = event.target as HTMLInputElement | null;
    const file = input?.files && input.files.length > 0 ? input.files[0] : null;
    if (!file) return;

    if (!this.#imageCompressionService.isValidImageFile(file)) {
      this.#globalNotification.openToastAlert(
        'Tipo de archivo no permitido',
        'Solo se permiten imágenes JPG, PNG o WebP',
        'danger',
      );
      if (input) input.value = '';
      return;
    }

    const originalSizeKB = file.size / 1024;

    if (file.size <= 50 * 1024) {
      console.log('Archivo ya está dentro del límite, no necesita compresión');
      this.processValidFile(file);
      return;
    }

    this.isCompressing.set(true);
    this.#globalNotification.openToastAlert(
      'Comprimiendo imagen',
      `Optimizando imagen de ${originalSizeKB.toFixed(0)} KB...`,
      'info',
    );

    try {
      const result = await this.#imageCompressionService.compressImage(file, 50);

      if (result.success && result.file) {
        const finalSizeKB = result.compressedSize / 1024;

        if (result.compressedSize > 50 * 1024) {
          this.#globalNotification.openToastAlert(
            'Imagen demasiado grande',
            `La imagen no pudo comprimirse a menos de 50KB. Tamaño final: ${finalSizeKB.toFixed(2)} KB. Por favor, selecciona una imagen más pequeña.`,
            'danger',
          );
          if (input) input.value = '';
          this.isCompressing.set(false);
          return;
        }

        const compressionRatio = (
          ((result.originalSize - result.compressedSize) / result.originalSize) *
          100
        ).toFixed(1);
        this.#globalNotification.openToastAlert(
          'Imagen optimizada',
          `Imagen comprimida exitosamente: ${originalSizeKB.toFixed(0)} KB → ${finalSizeKB.toFixed(2)} KB (${compressionRatio}% reducción)`,
          'success',
        );

        this.processValidFile(result.file);
      } else {
        throw new Error(result.error || 'Error desconocido en la compresión');
      }
    } catch (error) {
      console.error('Error al comprimir imagen:', error);
      this.#globalNotification.openToastAlert(
        'Error de compresión',
        'No se pudo comprimir la imagen. Por favor, intenta con otra imagen.',
        'danger',
      );
      if (input) input.value = '';
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

    this.form.patchValue({ image: file });
  }

  removeImage() {
    if (this.isCompressing()) return;

    this.selectedFile = null;
    this.imagePreview.set(null);
    this.form.patchValue({ image: null });
  }
}

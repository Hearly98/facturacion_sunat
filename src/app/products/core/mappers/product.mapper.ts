import { Product, CreateProduct, UpdateProduct, GetProduct } from '../models';
import { ProductDto, CreateProductDto, UpdateProductDto } from '../dto/product.dto';

export class ProductMapper {
  static fromApi(dto: ProductDto): Product {
    return {
      id: dto.id,
      branchId: dto.sucursal_id,
      categoryId: dto.categoria_id,
      name: dto.nombre,
      description: dto.descripcion,
      unitId: dto.unidad_id,
      internalCode: dto.codigo_interno,
      manufacturerCode: dto.codigo_fabricante,
      weight: dto.peso,
      image: dto.imagen,
      warehouses: dto.almacenes || [],
      currencyId: dto.moneda_id,
      brandId: dto.marca_id,
      basePurchasePrice: dto.precio_compra_base,
      baseSalePrice: dto.precio_venta_base,
      branches: dto.sucursales,
      active: dto.est,
      createdAt: dto.createdAt,
      updatedAt: dto.updatedAt,
    };
  }

  static toApiCreate(model: CreateProduct): CreateProductDto {
    return {
      categoria_id: model.categoryId,
      marca_id: model.brandId,
      nombre: model.name,
      descripcion: model.description,
      unidad_id: model.unitId,
      codigo_interno: model.internalCode,
      codigo_fabricante: model.manufacturerCode,
      peso: model.weight,
      sucursal_id: model.branchId,
      moneda_id: model.currencyId,
      precio_compra_base: model.basePurchasePrice,
      precio_venta_base: model.baseSalePrice,
      sucursales: model.branches || [],
    };
  }

  static toApiUpdate(model: UpdateProduct): UpdateProductDto {
    return {
      id: model.id,
      categoria_id: model.categoryId,
      marca_id: model.brandId,
      nombre: model.name,
      descripcion: model.description,
      unidad_id: model.unitId,
      codigo_interno: model.internalCode,
      codigo_fabricante: model.manufacturerCode,
      peso: model.weight,
      sucursal_id: model.branchId,
      moneda_id: model.currencyId,
      precio_compra_base: model.basePurchasePrice,
      precio_venta_base: model.baseSalePrice,
      sucursales: model.branches || [],
    };
  }

  static toApi(model: Product): ProductDto {
    return {
      id: model.id,
      sucursal_id: model.branchId,
      categoria_id: model.categoryId,
      marca_id: model.brandId,
      nombre: model.name,
      descripcion: model.description,
      unidad_id: model.unitId,
      codigo_interno: model.internalCode,
      codigo_fabricante: model.manufacturerCode,
      peso: model.weight,
      imagen: model.image,
      almacenes: model.warehouses || [],
      moneda_id: model.currencyId,
      precio_compra_base: model.basePurchasePrice,
      precio_venta_base: model.baseSalePrice,
      sucursales: model.branches || [],
      est: model.active,
      createdAt: model.createdAt,
      updatedAt: model.updatedAt,
    };
  }

  /**
   * Convert CreateProduct model to FormData for multipart requests
   * Image file is handled separately and not included in the model
   */
  static toFormDataCreate(model: CreateProduct, imageFile?: File): FormData {
    const formData = new FormData();

    formData.append('categoria_id', model.categoryId.toString());
    formData.append('marca_id', model.brandId.toString());
    formData.append('nombre', model.name);
    formData.append('descripcion', model.description);
    formData.append('unidad_id', model.unitId.toString());
    formData.append('codigo_interno', model.internalCode);
    formData.append('codigo_fabricante', model.manufacturerCode);
    formData.append('peso', model.weight.toString());
    formData.append('sucursal_id', model.branchId.toString());
    formData.append('moneda_id', model.currencyId.toString());
    formData.append('precio_compra_base', model.basePurchasePrice.toString());
    formData.append('precio_venta_base', model.baseSalePrice.toString());

    if (model.branches && model.branches.length > 0) {
      model.branches.forEach((branch, index) => {
        formData.append(`sucursales[${index}]`, branch.toString());
      });
    }

    if (imageFile) {
      formData.append('imagen', imageFile);
    }

    return formData;
  }

  /**
   * Convert UpdateProduct model to FormData for multipart requests
   * Image file is handled separately and not included in the model
   */
  static toFormDataUpdate(model: UpdateProduct, imageFile?: File): FormData {
    const formData = new FormData();

    formData.append('id', model.id.toString());
    formData.append('categoria_id', model.categoryId.toString());
    formData.append('marca_id', model.brandId.toString());
    formData.append('nombre', model.name);
    formData.append('descripcion', model.description);
    formData.append('unidad_id', model.unitId.toString());
    formData.append('codigo_interno', model.internalCode);
    formData.append('codigo_fabricante', model.manufacturerCode);
    formData.append('peso', model.weight.toString());
    formData.append('sucursal_id', model.branchId.toString());
    formData.append('moneda_id', model.currencyId.toString());
    formData.append('precio_compra_base', model.basePurchasePrice.toString());
    formData.append('precio_venta_base', model.baseSalePrice.toString());

    if (model.branches && model.branches.length > 0) {
      model.branches.forEach((branch, index) => {
        formData.append(`sucursales[${index}]`, branch.toString());
      });
    }

    if (imageFile) {
      formData.append('imagen', imageFile);
    }

    return formData;
  }
}

import { Brand, CreateBrand, UpdateBrand } from '../models';
import { BrandDto, CreateBrandDto, UpdateBrandDto } from '../dto/brand.dto';

export class BrandMapper {
  static fromApi(dto: BrandDto): Brand {
    return {
      id: dto.id,
      companyId: dto.empresaId,
      name: dto.nombre,
      code: dto.codigo,
      active: dto.activo,
      createdAt: dto.createdAt,
      updatedAt: dto.updatedAt,
    };
  }

  static toApiCreate(model: CreateBrand): CreateBrandDto {
    return {
      nombre: model.name,
      codigo: model.code,
    };
  }

  static toApiUpdate(model: UpdateBrand): UpdateBrandDto {
    return {
      id: model.id,
      nombre: model.name,
      codigo: model.code,
    };
  }

  static toApi(model: Brand): BrandDto {
    return {
      id: model.id,
      empresaId: model.companyId,
      nombre: model.name,
      codigo: model.code,
      activo: model.active,
      createdAt: model.createdAt,
      updatedAt: model.updatedAt,
    };
  }
}

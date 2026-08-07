import { Category, CreateCategory, UpdateCategory } from '../models';
import { CategoryDto, CreateCategoryDto, UpdateCategoryDto } from '../dto/category.dto';

export class CategoryMapper {
  static fromApi(dto: CategoryDto): Category {
    return {
      id: dto.id,
      code: dto.codigo,
      name: dto.nombre,
    };
  }

  static toApiCreate(model: CreateCategory): CreateCategoryDto {
    return {
      codigo: model.code,
      nombre: model.name,
    };
  }

  static toApiUpdate(model: UpdateCategory): UpdateCategoryDto {
    return {
      id: model.id,
      codigo: model.code,
      nombre: model.name,
    };
  }
}

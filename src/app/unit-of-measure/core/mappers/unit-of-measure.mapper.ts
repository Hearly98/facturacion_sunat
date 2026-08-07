import { UnitOfMeasure, CreateUnitOfMeasure, UpdateUnitOfMeasure } from '../models';
import { UnitOfMeasureDto, CreateUnitOfMeasureDto, UpdateUnitOfMeasureDto } from '../dto';

export class UnitOfMeasureMapper {
  static fromApi(dto: UnitOfMeasureDto): UnitOfMeasure {
    return {
      id: dto.id,
      code: dto.codigo,
      name: dto.nombre,
      abbreviation: dto.abreviatura,
    };
  }

  static toApiCreate(model: CreateUnitOfMeasure): CreateUnitOfMeasureDto {
    return {
      codigo: model.code,
      nombre: model.name,
      abreviatura: model.abbreviation,
    };
  }

  static toApiUpdate(model: UpdateUnitOfMeasure): UpdateUnitOfMeasureDto {
    return {
      id: model.id,
      codigo: model.code,
      nombre: model.name,
      abreviatura: model.abbreviation,
    };
  }

  static toApi(model: UnitOfMeasure): UnitOfMeasureDto {
    return {
      id: model.id,
      codigo: model.code,
      nombre: model.name,
      abreviatura: model.abbreviation,
    };
  }
}

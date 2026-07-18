import { Serie, CreateSerie, UpdateSerie } from '../models';
import { SerieDto, CreateSerieDto, UpdateSerieDto } from '../dto/serie.dto';

export class SerieMapper {
  static fromApi(dto: SerieDto): Serie {
    return {
      id: dto.id,
      code: dto.code,
      number: dto.number,
      counter: dto.counter,
      active: dto.active,
      createdAt: dto.createdAt,
      updatedAt: dto.updatedAt,
    };
  }

  static toApiCreate(model: CreateSerie): CreateSerieDto {
    return {
      code: model.code,
      number: model.number,
      counter: model.counter,
    };
  }

  static toApiUpdate(model: UpdateSerie): UpdateSerieDto {
    return {
      code: model.code,
      number: model.number,
      counter: model.counter,
    };
  }

  static toApi(model: Serie): SerieDto {
    return {
      id: model.id,
      code: model.code,
      number: model.number,
      counter: model.counter,
      active: model.active,
      createdAt: model.createdAt,
      updatedAt: model.updatedAt,
    };
  }
}

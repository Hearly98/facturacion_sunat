import { Serie, CreateSerie, UpdateSerie } from '../models';
import { SerieDto, CreateSerieDto, UpdateSerieDto } from '../dto/serie.dto';

export class SerieMapper {
  static fromApi(dto: SerieDto): Serie {
    return {
      id: dto.id,
      code: dto.docCod,
      number: dto.numero,
      counter: dto.correlativo,
      active: dto.activo,
      createdAt: dto.createdAt,
      updatedAt: dto.updatedAt,
    };
  }

  static toApiCreate(model: CreateSerie): CreateSerieDto {
    return {
      ser_num: model.number,
      doc_cod: model.code,
      ser_corr: model.counter,
    };
  }

  static toApiUpdate(model: UpdateSerie, id: number): UpdateSerieDto {
    return {
      id,
      ser_num: model.number,
      doc_cod: model.code,
      ser_corr: model.counter,
    };
  }
}

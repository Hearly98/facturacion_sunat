import { Currency, CreateCurrency, UpdateCurrency } from '../models';
import { CurrencyDto, CreateCurrencyDto, UpdateCurrencyDto } from '../dto/currency.dto';

export class CurrencyMapper {
  static fromApi(dto: CurrencyDto): Currency {
    return {
      id: dto.id,
      name: dto.nombre,
      code: dto.codigo,
      symbol: dto.simbolo,
      active: dto.est,
    };
  }

  static toApiCreate(model: CreateCurrency): CreateCurrencyDto {
    return {
      nombre: model.name,
      codigo: model.code,
      simbolo: model.symbol,
    };
  }

  static toApiUpdate(model: UpdateCurrency): UpdateCurrencyDto {
    return {
      nombre: model.name,
      codigo: model.code,
      simbolo: model.symbol,
    };
  }

  static toApi(model: Currency): CurrencyDto {
    return {
      id: model.id,
      nombre: model.name,
      codigo: model.code,
      simbolo: model.symbol,
      est: model.active,
    };
  }
}

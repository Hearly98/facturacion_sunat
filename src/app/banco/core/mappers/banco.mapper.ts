import { Banco, CreateBanco, UpdateBanco } from '../models';
import { BancoDto, CreateBancoDto, UpdateBancoDto } from '../dto/banco.dto';

export class BancoMapper {
  static fromApi(dto: BancoDto): Banco {
    return {
      id: dto.id,
      companyId: dto.empresaId,
      name: dto.nombre,
      accountNumber: dto.numeroCuenta,
      accountType: dto.tipoCuenta,
      currencyId: dto.monedaId,
      active: dto.activo,
      createdAt: dto.createdAt,
      updatedAt: dto.updatedAt,
    };
  }

  static toApiCreate(model: CreateBanco): CreateBancoDto {
    return {
      nombre: model.name,
      numero_cuenta: model.accountNumber,
      tipo_cuenta: model.accountType,
      moneda_id: model.currencyId,
    };
  }

  static toApiUpdate(model: UpdateBanco): UpdateBancoDto {
    return {
      nombre: model.name,
      numero_cuenta: model.accountNumber,
      tipo_cuenta: model.accountType,
      moneda_id: model.currencyId,
    };
  }
}

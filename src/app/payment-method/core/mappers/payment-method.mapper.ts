import { PaymentMethodDto, CreatePaymentMethodDto, UpdatePaymentMethodDto } from '../dto';
import { PaymentMethod, CreatePaymentMethod, UpdatePaymentMethod } from '../models';

export class PaymentMethodMapper {
  static fromApi(dto: PaymentMethodDto): PaymentMethod {
    return {
      id: dto.id,
      name: dto.nombre,
      active: dto.activo,
    };
  }

  static toApi(model: PaymentMethod): PaymentMethodDto {
    return {
      id: model.id,
      nombre: model.name,
      activo: model.active,
    };
  }

  static fromApiCreate(dto: CreatePaymentMethodDto): CreatePaymentMethod {
    return {
      name: dto.nombre,
      active: dto.activo,
    };
  }

  static toApiCreate(model: CreatePaymentMethod): CreatePaymentMethodDto {
    return {
      nombre: model.name,
      activo: model.active,
    };
  }

  static fromApiUpdate(dto: UpdatePaymentMethodDto): UpdatePaymentMethod {
    return {
      id: dto.id,
      name: dto.nombre,
      active: dto.activo,
    };
  }

  static toApiUpdate(model: UpdatePaymentMethod): UpdatePaymentMethodDto {
    return {
      id: model.id,
      nombre: model.name,
      activo: model.active,
    };
  }
}

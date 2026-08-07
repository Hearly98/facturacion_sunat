import { SupplierDto, CreateSupplierDto, UpdateSupplierDto } from '../dto';
import { Supplier, CreateSupplier, UpdateSupplier } from '../models';

export class SupplierMapper {
  static fromApi(dto: SupplierDto): Supplier {
    return {
      id: dto.id,
      companyId: dto.empresaId,
      documentTypeId: dto.tipoDocumentoId,
      name: dto.nombre,
      document: dto.documento,
      phone: dto.telefono,
      address: dto.direccion,
      email: dto.email,
      bank: dto.banco,
      account: dto.cuenta,
      active: dto.activo,
      createdAt: dto.createdAt,
      updatedAt: dto.updatedAt,
    };
  }

  static toApi(model: Supplier): SupplierDto {
    return {
      id: model.id,
      empresaId: model.companyId,
      tipoDocumentoId: model.documentTypeId,
      nombre: model.name,
      documento: model.document,
      telefono: model.phone,
      direccion: model.address,
      email: model.email,
      banco: model.bank,
      cuenta: model.account,
      activo: model.active,
      createdAt: model.createdAt,
      updatedAt: model.updatedAt,
    };
  }

  static fromApiCreate(dto: CreateSupplierDto): CreateSupplier {
    return {
      companyId: dto.empresaId,
      documentTypeId: dto.tipoDocumentoId,
      name: dto.nombre,
      document: dto.documento,
      phone: dto.telefono,
      address: dto.direccion,
      email: dto.email,
      bank: dto.banco,
      account: dto.cuenta,
      active: dto.activo,
    };
  }

  static toApiCreate(model: CreateSupplier): CreateSupplierDto {
    return {
      empresaId: model.companyId,
      tipoDocumentoId: model.documentTypeId,
      nombre: model.name,
      documento: model.document,
      telefono: model.phone,
      direccion: model.address,
      email: model.email,
      banco: model.bank,
      cuenta: model.account,
      activo: model.active,
    };
  }

  static fromApiUpdate(dto: UpdateSupplierDto): UpdateSupplier {
    return {
      id: dto.id,
      companyId: dto.empresaId,
      documentTypeId: dto.tipoDocumentoId,
      name: dto.nombre,
      document: dto.documento,
      phone: dto.telefono,
      address: dto.direccion,
      email: dto.email,
      bank: dto.banco,
      account: dto.cuenta,
      active: dto.activo,
    };
  }

  static toApiUpdate(model: UpdateSupplier): UpdateSupplierDto {
    return {
      id: model.id,
      empresaId: model.companyId,
      tipoDocumentoId: model.documentTypeId,
      nombre: model.name,
      documento: model.document,
      telefono: model.phone,
      direccion: model.address,
      email: model.email,
      banco: model.bank,
      cuenta: model.account,
      activo: model.active,
    };
  }
}

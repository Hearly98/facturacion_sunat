import { Sucursal, CreateSucursal, UpdateSucursal } from '../models';
import { SucursalDto, CreateSucursalDto, UpdateSucursalDto } from '../dto/sucursal.dto';

export class SucursalMapper {
  static fromApi(dto: SucursalDto): Sucursal {
    return {
      id: dto.id,
      companyId: dto.empresaId,
      name: dto.nombre,
      code: dto.codigo,
      address: dto.direccion,
      zip: dto.ubigeo,
      department: dto.departamento,
      province: dto.provincia,
      district: dto.distrito,
    };
  }

  static toApiCreate(model: CreateSucursal): CreateSucursalDto {
    return {
      nombre: model.name,
      codigo: model.code,
      direccion: model.address,
      ubigeo: model.zip,
      departamento: model.department,
      provincia: model.province,
      distrito: model.district,
    };
  }

  static toApiUpdate(model: UpdateSucursal): UpdateSucursalDto {
    return {
      nombre: model.name,
      codigo: model.code,
      direccion: model.address,
      ubigeo: model.zip,
      departamento: model.department,
      provincia: model.province,
      distrito: model.district,
    };
  }

  static toApi(model: Sucursal): SucursalDto {
    return {
      id: model.id,
      empresaId: model.companyId,
      nombre: model.name,
      codigo: model.code,
      direccion: model.address,
      ubigeo: model.zip,
      departamento: model.department,
      provincia: model.province,
      distrito: model.district,
    };
  }
}

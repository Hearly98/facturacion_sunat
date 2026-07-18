import { Injectable } from '@angular/core';
import { RolDto, CreateRolDto, UpdateRolDto } from '../dtos';
import { RolModel, CreateRol, UpdateRol } from '../models';

@Injectable({
  providedIn: 'root',
})
export class RolMapper {
  fromApiDto(dto: RolDto): RolModel {
    const model = new RolModel();
    model.id = dto.id;
    model.name = dto.nombre;
    model.active = dto.est;
    return model;
  }

  toApiDto(model: RolModel): RolDto {
    const dto = new RolDto();
    dto.id = model.id;
    dto.nombre = model.name;
    dto.est = model.active;
    return dto;
  }

  fromApiCreateDto(dto: CreateRolDto): CreateRol {
    return {
      name: dto.nombre,
      active: dto.est,
    };
  }

  toApiCreateDto(model: CreateRol): CreateRolDto {
    return {
      nombre: model.name,
      est: model.active,
    } as CreateRolDto;
  }

  fromApiUpdateDto(dto: UpdateRolDto): UpdateRol {
    return this.fromApiDto(dto);
  }

  toApiUpdateDto(model: UpdateRol): UpdateRolDto {
    return this.toApiDto(model);
  }
}

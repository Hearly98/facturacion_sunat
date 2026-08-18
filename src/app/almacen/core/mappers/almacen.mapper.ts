import { Injectable } from '@angular/core';
import { AlmacenDto, CreateAlmacenDto, UpdateAlmacenDto } from '../dtos';
import { GetAlmacenModel, CreateAlmacenModel, UpdateAlmacenModel } from '../models';
import { Sucursal } from 'src/app/sucursal/core/models';

@Injectable({
  providedIn: 'root',
})
export class AlmacenMapper {
  fromApi(dto: AlmacenDto): GetAlmacenModel {
    const model = new GetAlmacenModel();
    model.id = dto.id;
    model.empresaId = dto.emp_id ?? dto.empresa_id ?? 0;
    model.sucursalId = dto.suc_id ?? dto.sucursal_id ?? 0;
    model.codigo = dto.codigo;
    model.nombre = dto.nombre;
    model.descripcion = dto.descripcion ?? '';
    model.activo = dto.activo;
    // dto.sucursal solo viene de search() -- ver el comentario en AlmacenDto.
    if (dto.sucursal) {
      model.sucursal = { name: dto.sucursal.nombre } as Sucursal;
    }
    return model;
  }

  fromApiList(dtos: AlmacenDto[]): GetAlmacenModel[] {
    return dtos.map((dto) => this.fromApi(dto));
  }

  toApiCreate(model: CreateAlmacenModel): CreateAlmacenDto {
    return {
      sucursal_id: model.sucursalId,
      codigo: model.codigo,
      nombre: model.nombre,
      descripcion: model.descripcion,
    };
  }

  toApiUpdate(model: UpdateAlmacenModel): UpdateAlmacenDto {
    return {
      nombre: model.nombre,
      descripcion: model.descripcion,
    };
  }
}

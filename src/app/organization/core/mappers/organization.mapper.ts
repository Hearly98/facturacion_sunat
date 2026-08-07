import { Injectable } from '@angular/core';
import {
  OrganizationDto,
  CreateOrganizationDto,
  UpdateOrganizationDto,
} from '../dtos';
import { Organization, CreateOrganization, UpdateOrganization, GetOrganization } from '../models';

@Injectable({
  providedIn: 'root',
})
export class OrganizationMapper {
  fromApi(dto: OrganizationDto): GetOrganization {
    return {
      id: dto.id,
      name: dto.nombre,
      ruc: dto.ruc,
      email: dto.email,
      address: dto.direccion,
      phone: dto.telefono,
      website: dto.pagina_web,
      logo: dto.logo,
      status: dto.est,
      logoUrl: dto.logo_url,
    } as GetOrganization;
  }

  toApi(model: CreateOrganization | UpdateOrganization): CreateOrganizationDto | UpdateOrganizationDto {
    if ('id' in model) {
      return this.toApiUpdate(model as UpdateOrganization);
    }
    return this.toApiCreate(model as CreateOrganization);
  }

  toApiCreate(model: CreateOrganization): CreateOrganizationDto {
    return {
      nombre: model.name,
      ruc: model.ruc,
      email: model.email,
      direccion: model.address,
      telefono: model.phone,
      pagina_web: model.website,
      logo: model.logo,
      est: model.status,
    };
  }

  toApiUpdate(model: UpdateOrganization): UpdateOrganizationDto {
    return {
      id: model.id,
      nombre: model.name,
      ruc: model.ruc,
      email: model.email,
      direccion: model.address,
      telefono: model.phone,
      pagina_web: model.website,
      logo: model.logo,
      est: model.status,
    };
  }

  fromApiList(dtos: OrganizationDto[]): GetOrganization[] {
    return dtos.map((dto) => this.fromApi(dto));
  }
}

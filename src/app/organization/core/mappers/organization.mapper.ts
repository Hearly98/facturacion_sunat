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
      id: dto.emp_id,
      name: dto.emp_nom,
      ruc: dto.emp_ruc,
      email: dto.emp_correo,
      address: dto.emp_direcc,
      phone: dto.emp_telf,
      website: dto.emp_pag,
      logo: dto.emp_logo,
      status: dto.est,
      logoUrl: dto.logo_url,
    };
  }

  toApi(model: CreateOrganization | UpdateOrganization): CreateOrganizationDto | UpdateOrganizationDto {
    if ('id' in model) {
      return this.toApiUpdate(model as UpdateOrganization);
    }
    return this.toApiCreate(model as CreateOrganization);
  }

  toApiCreate(model: CreateOrganization): CreateOrganizationDto {
    return {
      emp_nom: model.name,
      emp_ruc: model.ruc,
      emp_correo: model.email,
      emp_direcc: model.address,
      emp_telf: model.phone,
      emp_pag: model.website,
      emp_logo: model.logo,
      est: model.status,
    };
  }

  toApiUpdate(model: UpdateOrganization): UpdateOrganizationDto {
    return {
      emp_id: model.id,
      com_id: 0,
      emp_nom: model.name,
      emp_ruc: model.ruc,
      emp_correo: model.email,
      emp_direcc: model.address,
      emp_telf: model.phone,
      emp_pag: model.website,
      emp_logo: model.logo,
      est: model.status,
    };
  }

  fromApiList(dtos: OrganizationDto[]): GetOrganization[] {
    return dtos.map((dto) => this.fromApi(dto));
  }
}

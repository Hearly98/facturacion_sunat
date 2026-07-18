import { Injectable } from '@angular/core';
import { BaseService } from '../../../shared/services/base.service';
import { HttpClient } from '@angular/common/http';
import { ResponseDto } from '../../../shared/models/api/response.dto';
import { QueryParamsModel } from '../../../shared/models/query/query-params.model';
import { QueryResultsModel } from '../../../shared/models/query/query-results.model';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { CreateOrganization, UpdateOrganization, GetOrganization } from '../models';
import { OrganizationDto, CreateOrganizationDto, UpdateOrganizationDto } from '../dtos';
import { OrganizationMapper } from '../mappers';

@Injectable({
  providedIn: 'root',
})
export class OrganizationService extends BaseService {
  constructor(http: HttpClient, private mapper: OrganizationMapper) {
    super(http, `${environment.apiUrl}/empresas`);
  }

  getAll(): Observable<ResponseDto<GetOrganization[]>> {
    return this.getRequest<ResponseDto<OrganizationDto[]>>('').pipe(
      map((response) => ({
        ...response,
        data: this.mapper.fromApiList(response.data),
      }))
    );
  }

  getById(id: number): Observable<ResponseDto<GetOrganization>> {
    return this.getRequest<ResponseDto<OrganizationDto>>(`/${id}`).pipe(
      map((response) => ({
        ...response,
        data: this.mapper.fromApi(response.data),
      }))
    );
  }

  create(body: CreateOrganization | FormData): Observable<ResponseDto<GetOrganization>> {
    if (body instanceof FormData) {
      return this.postRequestForm<ResponseDto<OrganizationDto>>('/', body).pipe(
        map((response) => ({
          ...response,
          data: this.mapper.fromApi(response.data),
        }))
      );
    }
    const dto = this.mapper.toApiCreate(body as CreateOrganization);
    return this.postRequest<CreateOrganizationDto, ResponseDto<OrganizationDto>>('/', dto).pipe(
      map((response) => ({
        ...response,
        data: this.mapper.fromApi(response.data),
      }))
    );
  }

  update(body: UpdateOrganization | FormData): Observable<ResponseDto<GetOrganization>> {
    if (body instanceof FormData) {
      return this.putRequestForm<ResponseDto<OrganizationDto>>('/', body).pipe(
        map((response) => ({
          ...response,
          data: this.mapper.fromApi(response.data),
        }))
      );
    }
    const dto = this.mapper.toApiUpdate(body as UpdateOrganization);
    return this.putRequest<UpdateOrganizationDto, ResponseDto<OrganizationDto>>('/', dto).pipe(
      map((response) => ({
        ...response,
        data: this.mapper.fromApi(response.data),
      }))
    );
  }

  delete(id: number): Observable<ResponseDto<GetOrganization>> {
    return this.deleteRequest<ResponseDto<OrganizationDto>>(`/${id}`).pipe(
      map((response) => ({
        ...response,
        data: this.mapper.fromApi(response.data),
      }))
    );
  }

  search(body: QueryParamsModel): Observable<ResponseDto<QueryResultsModel<GetOrganization>>> {
    return this.postRequest<QueryParamsModel, ResponseDto<QueryResultsModel<OrganizationDto>>>(
      `/search`,
      body
    ).pipe(
      map((response) => ({
        ...response,
        data: {
          ...response.data,
          items: this.mapper.fromApiList(response.data.items),
        },
      }))
    );
  }

  getMe(): Observable<ResponseDto<GetOrganization>> {
    return this.getRequest<ResponseDto<OrganizationDto>>('/me').pipe(
      map((response) => ({
        ...response,
        data: this.mapper.fromApi(response.data),
      }))
    );
  }
}

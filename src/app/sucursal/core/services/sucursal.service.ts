import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { BaseService } from '../../../shared/services/base.service';
import { ResponseDto } from '../../../shared/models/api/response.dto';
import { Sucursal, CreateSucursal, UpdateSucursal, StockBySucursalModel } from '../models';
import { SucursalDto, CreateSucursalDto, UpdateSucursalDto } from '../dto/sucursal.dto';
import { SucursalMapper } from '../mappers/sucursal.mapper';
import { QueryParamsModel } from '../../../shared/models/query/query-params.model';
import { QueryResultsModel } from '../../../shared/models/query/query-results.model';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class SucursalService extends BaseService {
  constructor(http: HttpClient) {
    super(http, `${environment.apiUrl}/sucursales`);
  }

  getAll(): Observable<ResponseDto<Sucursal[]>> {
    return this.getRequest<ResponseDto<SucursalDto[]>>('').pipe(
      map(response => ({
        ...response,
        data: response.data.map(dto => SucursalMapper.fromApi(dto)),
      }))
    );
  }

  getById(id: number): Observable<ResponseDto<Sucursal>> {
    return this.getRequest<ResponseDto<SucursalDto>>(`/${id}`).pipe(
      map(response => ({
        ...response,
        data: SucursalMapper.fromApi(response.data),
      }))
    );
  }

  create(body: CreateSucursal): Observable<ResponseDto<Sucursal>> {
    const dto = SucursalMapper.toApiCreate(body);
    return this.postRequest<CreateSucursalDto, ResponseDto<SucursalDto>>(`/`, dto).pipe(
      map(response => ({
        ...response,
        data: SucursalMapper.fromApi(response.data),
      }))
    );
  }

  delete(id: number): Observable<ResponseDto<Sucursal | null>> {
    return this.deleteRequest<ResponseDto<SucursalDto>>(`/${id}`).pipe(
      map(response => ({
        ...response,
        data: response.data ? SucursalMapper.fromApi(response.data) : null,
      }))
    );
  }

  update(id: number, body: UpdateSucursal): Observable<ResponseDto<Sucursal>> {
    const dto = SucursalMapper.toApiUpdate(body);
    return this.putRequest<UpdateSucursalDto, ResponseDto<SucursalDto>>(`/${id}`, dto).pipe(
      map(response => ({
        ...response,
        data: SucursalMapper.fromApi(response.data),
      }))
    );
  }

  search(body: QueryParamsModel): Observable<ResponseDto<QueryResultsModel<Sucursal>>> {
    return this.postRequest<QueryParamsModel, ResponseDto<QueryResultsModel<SucursalDto>>>(
      `/search`,
      body
    ).pipe(
      map(response => ({
        ...response,
        data: new QueryResultsModel(
          response.data.items.map(dto => SucursalMapper.fromApi(dto)),
          response.data.total,
          response.data.errorMessage
        ),
      }))
    );
  }

  getStockBySucursal(sucId: number): Observable<ResponseDto<StockBySucursalModel>> {
    return this.getRequest<ResponseDto<StockBySucursalModel>>(`/${sucId}/stock`);
  }
}





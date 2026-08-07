import { Injectable } from '@angular/core';
import { BaseService } from '@shared/services/base.service';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { ResponseDto } from '@shared/models/api/response.dto';
import { UnitOfMeasure, CreateUnitOfMeasure, UpdateUnitOfMeasure } from '../models';
import { UnitOfMeasureDto, CreateUnitOfMeasureDto, UpdateUnitOfMeasureDto } from '../dto';
import { UnitOfMeasureMapper } from '../mappers/unit-of-measure.mapper';
import { environment } from '@environments/environment';
import { QueryResultsModel } from '@shared/models/query/query-results.model';
import { QueryParamsModel } from '@shared/models/query/query-params.model';

@Injectable({ providedIn: 'root' })
export class UnitOfMeasureService extends BaseService {
  constructor(http: HttpClient) {
    super(http, `${environment.apiUrl}/unidades`);
  }

  getAll(): Observable<ResponseDto<UnitOfMeasure[]>> {
    return this.getRequest<ResponseDto<UnitOfMeasureDto[]>>('').pipe(
      map(response => ({
        ...response,
        data: response.data.map(dto => UnitOfMeasureMapper.fromApi(dto)),
      }))
    );
  }

  create(body: CreateUnitOfMeasure): Observable<ResponseDto<UnitOfMeasure>> {
    const dto = UnitOfMeasureMapper.toApiCreate(body);
    return this.postRequest<CreateUnitOfMeasureDto, ResponseDto<UnitOfMeasureDto>>('/', dto).pipe(
      map(response => ({
        ...response,
        data: UnitOfMeasureMapper.fromApi(response.data),
      }))
    );
  }

  update(body: UpdateUnitOfMeasure): Observable<ResponseDto<UnitOfMeasure>> {
    const dto = UnitOfMeasureMapper.toApiUpdate(body);
    return this.putRequest<UpdateUnitOfMeasureDto, ResponseDto<UnitOfMeasureDto>>('/', dto).pipe(
      map(response => ({
        ...response,
        data: UnitOfMeasureMapper.fromApi(response.data),
      }))
    );
  }

  getById(id: number): Observable<ResponseDto<UnitOfMeasure>> {
    return this.getRequest<ResponseDto<UnitOfMeasureDto>>(`/${id}`).pipe(
      map(response => ({
        ...response,
        data: UnitOfMeasureMapper.fromApi(response.data),
      }))
    );
  }

  delete(id: number): Observable<ResponseDto<UnitOfMeasure | null>> {
    return this.deleteRequest<ResponseDto<UnitOfMeasureDto>>(`/${id}`).pipe(
      map(response => ({
        ...response,
        data: response.data ? UnitOfMeasureMapper.fromApi(response.data) : null,
      }))
    );
  }

  search(params: QueryParamsModel): Observable<ResponseDto<QueryResultsModel<UnitOfMeasure>>> {
    return this.postRequest<QueryParamsModel, ResponseDto<QueryResultsModel<UnitOfMeasureDto>>>(
      '/search',
      params
    ).pipe(
      map(response => ({
        ...response,
        data: new QueryResultsModel(
          response.data.items.map(dto => UnitOfMeasureMapper.fromApi(dto)),
          response.data.total,
          response.data.errorMessage
        ),
      }))
    );
  }
}

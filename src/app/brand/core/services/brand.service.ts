import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { BaseService } from '../../../shared/services/base.service';
import { ResponseDto } from '@shared/models/api/response.dto';
import { Brand, CreateBrand, UpdateBrand } from '../models';
import { BrandDto, CreateBrandDto, UpdateBrandDto } from '../dto/brand.dto';
import { BrandMapper } from '../mappers/brand.mapper';
import { QueryParamsModel } from '../../../shared/models/query/query-params.model';
import { QueryResultsModel } from '../../../shared/models/query/query-results.model';
import { environment } from '@environments/environment';

@Injectable({ providedIn: 'root' })
export class BrandService extends BaseService {
  constructor(http: HttpClient) {
    super(http, `${environment.apiUrl}/v1/marcas`);
  }

  getAll(): Observable<ResponseDto<Brand[]>> {
    return this.getRequest<ResponseDto<BrandDto[]>>('').pipe(
      map(response => ({
        ...response,
        data: response.data.map(dto => BrandMapper.fromApi(dto)),
      }))
    );
  }

  getById(id: number): Observable<ResponseDto<Brand>> {
    return this.getRequest<ResponseDto<BrandDto>>(`/${id}`).pipe(
      map(response => ({
        ...response,
        data: BrandMapper.fromApi(response.data),
      }))
    );
  }

  create(body: CreateBrand): Observable<ResponseDto<Brand>> {
    const dto = BrandMapper.toApiCreate(body);
    return this.postRequest<CreateBrandDto, ResponseDto<BrandDto>>('/', dto).pipe(
      map(response => ({
        ...response,
        data: BrandMapper.fromApi(response.data),
      }))
    );
  }

  update(id: number, body: UpdateBrand): Observable<ResponseDto<Brand>> {
    const dto = BrandMapper.toApiUpdate(body);
    return this.putRequest<UpdateBrandDto, ResponseDto<BrandDto>>(`/${id}`, dto).pipe(
      map(response => ({
        ...response,
        data: BrandMapper.fromApi(response.data),
      }))
    );
  }

  delete(id: number): Observable<ResponseDto<Brand | null>> {
    return this.deleteRequest<ResponseDto<BrandDto>>(`/${id}`).pipe(
      map(response => ({
        ...response,
        data: response.data ? BrandMapper.fromApi(response.data) : null,
      }))
    );
  }

  search(params: QueryParamsModel): Observable<ResponseDto<QueryResultsModel<Brand>>> {
    return this.postRequest<QueryParamsModel, ResponseDto<QueryResultsModel<BrandDto>>>(
      '/search',
      params
    ).pipe(
      map(response => ({
        ...response,
        data: new QueryResultsModel(
          response.data.items.map(dto => BrandMapper.fromApi(dto)),
          response.data.total,
          response.data.errorMessage
        ),
      }))
    );
  }
}

import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { BaseService } from '../../../shared/services/base.service';
import { QueryParamsModel } from '@shared/models/query/query-params.model';
import { map, Observable } from 'rxjs';
import { ResponseDto } from '@shared/models/api/response.dto';
import { QueryResultsModel } from '@shared/models/query/query-results.model';
import { CreateSupplier, Supplier, UpdateSupplier } from '../models';
import { SupplierDto, CreateSupplierDto, UpdateSupplierDto } from '../dto';
import { SupplierMapper } from '../mappers';

@Injectable({
  providedIn: 'root',
})
export class SupplierService extends BaseService {
  constructor(http: HttpClient) {
    super(http, `${environment.apiUrl}/proveedores`);
  }

  getAll(): Observable<ResponseDto<Supplier[]>> {
    return this.getRequest<ResponseDto<SupplierDto[]>>('').pipe(
      map((response) => ({
        ...response,
        data: response.data.map((dto) => SupplierMapper.fromApi(dto)),
      }))
    );
  }

  create(body: CreateSupplier): Observable<ResponseDto<Supplier>> {
    const dto = SupplierMapper.toApiCreate(body);
    return this.postRequest<CreateSupplierDto, ResponseDto<SupplierDto>>('/', dto).pipe(
      map((response) => ({
        ...response,
        data: SupplierMapper.fromApi(response.data),
      }))
    );
  }

  update(body: UpdateSupplier): Observable<ResponseDto<Supplier>> {
    const dto = SupplierMapper.toApiUpdate(body);
    return this.putRequest<UpdateSupplierDto, ResponseDto<SupplierDto>>('/', dto).pipe(
      map((response) => ({
        ...response,
        data: SupplierMapper.fromApi(response.data),
      }))
    );
  }

  getById(id: number): Observable<ResponseDto<Supplier>> {
    return this.getRequest<ResponseDto<SupplierDto>>(`/${id}`).pipe(
      map((response) => ({
        ...response,
        data: SupplierMapper.fromApi(response.data),
      }))
    );
  }

  delete(id: number): Observable<ResponseDto<Supplier | null>> {
    return this.deleteRequest<ResponseDto<SupplierDto>>(`/${id}`).pipe(
      map((response) => ({
        ...response,
        data: response.data ? SupplierMapper.fromApi(response.data) : null,
      }))
    );
  }

  search(body: QueryParamsModel): Observable<ResponseDto<QueryResultsModel<Supplier>>> {
    return this.postRequest<QueryParamsModel, ResponseDto<QueryResultsModel<SupplierDto>>>(
      `/search`,
      body
    ).pipe(
      map((response) => ({
        ...response,
        data: {
          ...response.data,
          items: response.data.items.map((dto) => SupplierMapper.fromApi(dto)),
        },
      }))
    );
  }

  searchQuick(term: string): Observable<Supplier[]> {
    const body = new QueryParamsModel(
      { nombre: term }, // filter - using API property name
      { page: 1, pageSize: 10 }, // page
      [{ property: 'nombre', direction: 'asc' }] // sort
    );

    return this.search(body).pipe(map((response) => response.data.items));
  }
}

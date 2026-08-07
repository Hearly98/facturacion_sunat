import { Injectable } from '@angular/core';
import { BaseService } from '../../../shared/services/base.service';
import { environment } from '../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ResponseDto } from '@shared/models/api/response.dto';
import { CreateCustomer, GetCustomer, UpdateCustomer } from '../models';
import { CustomerDto, CreateCustomerDto, UpdateCustomerDto } from '../dto';
import { CustomerMapper } from '../mappers';
import { QueryParamsModel } from '@shared/models/query/query-params.model';
import { QueryResultsModel } from '@shared/models/query/query-results.model';

@Injectable({
  providedIn: 'root',
})
export class CustomerService extends BaseService {
  constructor(http: HttpClient) {
    super(http, `${environment.apiUrl}/clientes`);
  }

  getAll(): Observable<ResponseDto<GetCustomer[]>> {
    return this.getRequest<ResponseDto<CustomerDto[]>>('').pipe(
      map(response => ({
        ...response,
        data: response.data.map(dto => CustomerMapper.fromApi(dto)),
      }))
    );
  }

  create(body: CreateCustomer): Observable<ResponseDto<GetCustomer>> {
    const dto = CustomerMapper.toApiCreate(body);
    return this.postRequest<CreateCustomerDto, ResponseDto<CustomerDto>>('/', dto).pipe(
      map(response => ({
        ...response,
        data: CustomerMapper.fromApi(response.data),
      }))
    );
  }

  update(body: UpdateCustomer): Observable<ResponseDto<GetCustomer>> {
    const dto = CustomerMapper.toApiUpdate(body);
    return this.putRequest<UpdateCustomerDto, ResponseDto<CustomerDto>>('/', dto).pipe(
      map(response => ({
        ...response,
        data: CustomerMapper.fromApi(response.data),
      }))
    );
  }

  getById(id: number): Observable<ResponseDto<GetCustomer>> {
    return this.getRequest<ResponseDto<CustomerDto>>(`/${id}`).pipe(
      map(response => ({
        ...response,
        data: CustomerMapper.fromApi(response.data),
      }))
    );
  }

  delete(id: number): Observable<ResponseDto<GetCustomer | null>> {
    return this.deleteRequest<ResponseDto<CustomerDto>>(`/${id}`).pipe(
      map(response => ({
        ...response,
        data: response.data ? CustomerMapper.fromApi(response.data) : null,
      }))
    );
  }

  search(body: QueryParamsModel): Observable<ResponseDto<QueryResultsModel<GetCustomer>>> {
    return this.postRequest<QueryParamsModel, ResponseDto<QueryResultsModel<CustomerDto>>>(
      `/search`,
      body
    ).pipe(
      map(response => ({
        ...response,
        data: {
          ...response.data,
          items: response.data.items.map(dto => CustomerMapper.fromApi(dto)),
        },
      }))
    );
  }

  searchQuick(term: string): Observable<ResponseDto<GetCustomer[]>> {
    return this.postRequest<{ term: string }, ResponseDto<CustomerDto[]>>('/search-quick', { term }).pipe(
      map(response => ({
        ...response,
        data: response.data.map(dto => CustomerMapper.fromApi(dto)),
      }))
    );
  }
}

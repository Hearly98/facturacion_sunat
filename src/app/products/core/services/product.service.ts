import { Injectable } from '@angular/core';
import { BaseService } from '../../../shared/services/base.service';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { ResponseDto } from '../../../shared/models/api/response.dto';
import { QueryParamsModel } from '../../../shared/models/query/query-params.model';
import { QueryResultsModel } from '../../../shared/models/query/query-results.model';
import { CreateProduct, GetProduct, UpdateProduct, Product } from '../models';
import { ProductDto, CreateProductDto, UpdateProductDto } from '../dto/product.dto';
import { ProductMapper } from '../mappers/product.mapper';
import { environment } from '../../../../environments/environment';
import { ProductoSearchDto } from '../models/product-search-dto';

@Injectable({
  providedIn: 'root',
})
export class ProductService extends BaseService {
  constructor(http: HttpClient) {
    super(http, `${environment.apiUrl}/productos`);
  }

  getAll(): Observable<ResponseDto<Product[]>> {
    return this.getRequest<ResponseDto<ProductDto[]>>('').pipe(
      map(response => ({
        ...response,
        data: response.data.map(dto => ProductMapper.fromApi(dto)),
      }))
    );
  }

  create(body: CreateProduct, imageFile?: File): Observable<ResponseDto<Product>> {
    const formData = ProductMapper.toFormDataCreate(body, imageFile);
    return this.postRequestForm<ResponseDto<ProductDto>>('/', formData).pipe(
      map(response => ({
        ...response,
        data: ProductMapper.fromApi(response.data),
      }))
    );
  }

  createBulk(body: CreateProduct, imageFile?: File): Observable<ResponseDto<Product>> {
    const formData = ProductMapper.toFormDataCreate(body, imageFile);
    return this.postRequestForm<ResponseDto<ProductDto>>('/bulk', formData).pipe(
      map(response => ({
        ...response,
        data: ProductMapper.fromApi(response.data),
      }))
    );
  }

  update(body: UpdateProduct, imageFile?: File): Observable<ResponseDto<Product>> {
    const formData = ProductMapper.toFormDataUpdate(body, imageFile);
    return this.postRequestForm<ResponseDto<ProductDto>>('/update', formData).pipe(
      map(response => ({
        ...response,
        data: ProductMapper.fromApi(response.data),
      }))
    );
  }

  getById(id: number): Observable<ResponseDto<Product>> {
    return this.getRequest<ResponseDto<ProductDto>>(`/${id}`).pipe(
      map(response => ({
        ...response,
        data: ProductMapper.fromApi(response.data),
      }))
    );
  }

  delete(id: number): Observable<ResponseDto<Product | null>> {
    return this.deleteRequest<ResponseDto<ProductDto>>(`/${id}`).pipe(
      map(response => ({
        ...response,
        data: response.data ? ProductMapper.fromApi(response.data) : null,
      }))
    );
  }

  search(body: QueryParamsModel): Observable<ResponseDto<QueryResultsModel<Product>>> {
    return this.postRequest<QueryParamsModel, ResponseDto<QueryResultsModel<ProductDto>>>(
      `/search`,
      body
    ).pipe(
      map(response => ({
        ...response,
        data: new QueryResultsModel(
          response.data.items.map(dto => ProductMapper.fromApi(dto)),
          response.data.total,
          response.data.errorMessage
        ),
      }))
    );
  }

  searchQuick(body: {
    term: string;
    suc_id?: number;
    almacen_id?: number;
  }): Observable<ResponseDto<ProductoSearchDto[]>> {
    return this.postRequest(`/search-quick`, body);
  }

  /**
   * Search all products without warehouse requirement
   * Used for Cotizaciones where stock is not affected
   */
  searchAll(term: string): Observable<ResponseDto<Product[]>> {
    return this.postRequest<{ term: string }, ResponseDto<ProductDto[]>>('/search-all', { term }).pipe(
      map(response => ({
        ...response,
        data: response.data.map(dto => ProductMapper.fromApi(dto)),
      }))
    );
  }
}

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { BaseService } from '../../../shared/services/base.service';
import { ResponseDto } from '@shared/models/api/response.dto';
import { Category, CreateCategory, UpdateCategory } from '../models';
import { CategoryDto, CreateCategoryDto, UpdateCategoryDto } from '../dto/category.dto';
import { CategoryMapper } from '../mappers/category.mapper';
import { QueryParamsModel } from '../../../shared/models/query/query-params.model';
import { QueryResultsModel } from '../../../shared/models/query/query-results.model';
import { environment } from '@environments/environment';

@Injectable({ providedIn: 'root' })
export class CategoryService extends BaseService {
  constructor(http: HttpClient) {
    super(http, `${environment.apiUrl}/categorias`);
  }

  getAll(): Observable<ResponseDto<Category[]>> {
    return this.getRequest<ResponseDto<CategoryDto[]>>('').pipe(
      map(response => ({
        ...response,
        data: response.data.map(dto => CategoryMapper.fromApi(dto)),
      }))
    );
  }

  getById(id: number): Observable<ResponseDto<Category>> {
    return this.getRequest<ResponseDto<CategoryDto>>(`/${id}`).pipe(
      map(response => ({
        ...response,
        data: CategoryMapper.fromApi(response.data),
      }))
    );
  }

  create(body: CreateCategory): Observable<ResponseDto<Category>> {
    const dto = CategoryMapper.toApiCreate(body);
    return this.postRequest<CreateCategoryDto, ResponseDto<CategoryDto>>('/', dto).pipe(
      map(response => ({
        ...response,
        data: CategoryMapper.fromApi(response.data),
      }))
    );
  }

  update(body: UpdateCategory): Observable<ResponseDto<Category>> {
    const dto = CategoryMapper.toApiUpdate(body);
    return this.putRequest<UpdateCategoryDto, ResponseDto<CategoryDto>>('/', dto).pipe(
      map(response => ({
        ...response,
        data: CategoryMapper.fromApi(response.data),
      }))
    );
  }

  delete(id: number): Observable<ResponseDto<Category | null>> {
    return this.deleteRequest<ResponseDto<CategoryDto>>(`/${id}`).pipe(
      map(response => ({
        ...response,
        data: response.data ? CategoryMapper.fromApi(response.data) : null,
      }))
    );
  }

  search(params: QueryParamsModel): Observable<ResponseDto<QueryResultsModel<Category>>> {
    return this.postRequest<QueryParamsModel, ResponseDto<QueryResultsModel<CategoryDto>>>(
      `/search`,
      params
    ).pipe(
      map(response => ({
        ...response,
        data: new QueryResultsModel(
          response.data.items.map(dto => CategoryMapper.fromApi(dto)),
          response.data.total,
          response.data.errorMessage
        ),
      }))
    );
  }
}

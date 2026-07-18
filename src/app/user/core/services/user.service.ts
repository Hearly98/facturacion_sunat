import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@environments/environment';
import { BaseService } from '@shared/services/base.service';
import { User, CreateUser, UpdateUser } from '../models';
import { UserDto, CreateUserDto, UpdateUserDto } from '../dto/user.dto';
import { UserMapper } from '../mappers/user.mapper';
import { map, Observable } from 'rxjs';
import { ResponseDto } from '@shared/models/api/response.dto';
import { QueryParamsModel } from '@shared/models/query/query-params.model';
import { QueryResultsModel } from '@shared/models/query/query-results.model';

@Injectable({
  providedIn: 'root',
})
export class UserService extends BaseService {
  constructor(http: HttpClient) {
    super(http, `${environment.apiUrl}/usuarios`);
  }

  getAll(): Observable<ResponseDto<User[]>> {
    return this.getRequest<ResponseDto<UserDto[]>>('').pipe(
      map(response => ({
        ...response,
        data: response.data.map(dto => UserMapper.fromApi(dto)),
      }))
    );
  }

  getById(id: number): Observable<ResponseDto<User>> {
    return this.getRequest<ResponseDto<UserDto>>(`/${id}`).pipe(
      map(response => ({
        ...response,
        data: UserMapper.fromApi(response.data),
      }))
    );
  }

  create(body: CreateUser): Observable<ResponseDto<User>> {
    const dto = UserMapper.toApiCreate(body);
    return this.postRequest<CreateUserDto, ResponseDto<UserDto>>('/', dto).pipe(
      map(response => ({
        ...response,
        data: UserMapper.fromApi(response.data),
      }))
    );
  }

  update(body: UpdateUser): Observable<ResponseDto<User>> {
    const dto = UserMapper.toApiUpdate(body);
    return this.putRequest<UpdateUserDto, ResponseDto<UserDto>>('/', dto).pipe(
      map(response => ({
        ...response,
        data: UserMapper.fromApi(response.data),
      }))
    );
  }

  delete(id: number): Observable<ResponseDto<User | null>> {
    return this.deleteRequest<ResponseDto<UserDto>>(`/${id}`).pipe(
      map(response => ({
        ...response,
        data: response.data ? UserMapper.fromApi(response.data) : null,
      }))
    );
  }

  search(body: QueryParamsModel): Observable<ResponseDto<QueryResultsModel<User>>> {
    return this.postRequest<QueryParamsModel, ResponseDto<QueryResultsModel<UserDto>>>(
      `/search`,
      body
    ).pipe(
      map(response => ({
        ...response,
        data: new QueryResultsModel(
          response.data.items.map(dto => UserMapper.fromApi(dto)),
          response.data.total,
          response.data.errorMessage
        ),
      }))
    );
  }

  getMe(): Observable<ResponseDto<User>> {
    return this.getRequest<ResponseDto<UserDto>>('/me').pipe(
      map(response => ({
        ...response,
        data: UserMapper.fromApi(response.data),
      }))
    );
  }
}

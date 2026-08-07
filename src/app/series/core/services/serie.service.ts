import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ResponseDto } from '@shared/models/api/response.dto';
import { BaseService } from '@shared/services/base.service';
import { Serie, CreateSerie, UpdateSerie } from '../models';
import { SerieDto, CreateSerieDto, UpdateSerieDto } from '../dto/serie.dto';
import { SerieMapper } from '../mappers/serie.mapper';
import { PageParamsModel } from '@shared/models/query/page-params.model';

@Injectable({
  providedIn: 'root',
})
export class SerieService extends BaseService {
  constructor(http: HttpClient) {
    super(http, `${environment.apiUrl}/series`);
  }

  search(params: PageParamsModel): Observable<ResponseDto<{ items: Serie[]; total: number }>> {
    return this.postRequest<PageParamsModel, ResponseDto<{ items: SerieDto[]; total: number }>>(
      '/search',
      params
    ).pipe(
      map(response => ({
        ...response,
        data: {
          ...response.data,
          items: response.data.items.map(dto => SerieMapper.fromApi(dto)),
        },
      }))
    );
  }

  getAll(): Observable<ResponseDto<Serie[]>> {
    return this.getRequest<ResponseDto<SerieDto[]>>('').pipe(
      map(response => ({
        ...response,
        data: response.data.map(dto => SerieMapper.fromApi(dto)),
      }))
    );
  }

  getById(id: number): Observable<ResponseDto<Serie>> {
    return this.getRequest<ResponseDto<SerieDto>>(`/${id}`).pipe(
      map(response => ({
        ...response,
        data: SerieMapper.fromApi(response.data),
      }))
    );
  }

  create(data: CreateSerie): Observable<ResponseDto<Serie>> {
    const dto = SerieMapper.toApiCreate(data);
    return this.postRequest<CreateSerieDto, ResponseDto<SerieDto>>('', dto).pipe(
      map(response => ({
        ...response,
        data: SerieMapper.fromApi(response.data),
      }))
    );
  }

  update(id: number, data: UpdateSerie): Observable<ResponseDto<Serie>> {
    const dto = SerieMapper.toApiUpdate(data, id);
    return this.putRequest<UpdateSerieDto, ResponseDto<SerieDto>>('', dto).pipe(
      map(response => ({
        ...response,
        data: SerieMapper.fromApi(response.data),
      }))
    );
  }

  delete(id: number): Observable<ResponseDto<void>> {
    return this.deleteRequest<ResponseDto<void>>(`/${id}`);
  }
}

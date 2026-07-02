import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BaseService } from '../../../shared/services/base.service';
import { Observable } from 'rxjs';
import { ResponseDto } from '../../../shared/models/api/response.dto';
import { environment } from '../../../../environments/environment';
import { CreateMarcaModel, GetMarcaModel, UpdateMarcaModel } from '../models';
import { QueryParamsModel } from '@shared/models/query/query-params.model';
import { QueryResultsModel } from '@shared/models/query/query-results.model';

@Injectable({
    providedIn: 'root',
})
export class BrandService extends BaseService {
    constructor(http: HttpClient) {
        super(http, `${environment.apiUrl}/marcas`);
    }

    getAll(): Observable<ResponseDto<GetMarcaModel[]>> {
        return this.getRequest<ResponseDto<GetMarcaModel[]>>('');
    }

    getById(id: number): Observable<ResponseDto<GetMarcaModel>> {
        return this.getRequest<ResponseDto<GetMarcaModel>>(`/${id}`);
    }

    create(body: CreateMarcaModel): Observable<ResponseDto<GetMarcaModel>> {
        return this.postRequest<CreateMarcaModel, ResponseDto<GetMarcaModel>>('/', body);
    }

    update(body: UpdateMarcaModel): Observable<ResponseDto<GetMarcaModel>> {
        return this.putRequest<UpdateMarcaModel, ResponseDto<GetMarcaModel>>(`/${body.id}`, body);
    }

    delete(id: number): Observable<ResponseDto<any>> {
        return this.deleteRequest(`/${id}`);
    }

    search(body: QueryParamsModel): Observable<ResponseDto<QueryResultsModel<GetMarcaModel>>> {
        return this.postRequest<QueryParamsModel, ResponseDto<QueryResultsModel<GetMarcaModel>>>(
            `/search`,
            body
        );
    }
}

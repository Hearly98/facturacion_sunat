import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BaseService } from '../../../shared/services/base.service';
import { Observable } from 'rxjs';
import { ResponseDto } from '../../../shared/models/api/response.dto';
import { environment } from '../../../../environments/environment';
import { ProductoAlmacenModel } from '../models/producto-almacen.model';

@Injectable({
    providedIn: 'root',
})
export class ProductoAlmacenService extends BaseService {
    constructor(http: HttpClient) {
        super(http, `${environment.apiUrl}/producto-almacen`);
    }

    getByAlmacen(almacenId: number): Observable<ResponseDto<ProductoAlmacenModel[]>> {
        return this.getRequest<ResponseDto<ProductoAlmacenModel[]>>(`/almacen/${almacenId}`);
    }

    getByProducto(productoId: number): Observable<ResponseDto<ProductoAlmacenModel[]>> {
        return this.getRequest<ResponseDto<ProductoAlmacenModel[]>>(`/producto/${productoId}`);
    }
}

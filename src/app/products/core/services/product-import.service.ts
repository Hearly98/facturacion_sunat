import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseService } from '../../../shared/services/base.service';
import { ResponseDto } from '../../../shared/models/api/response.dto';
import { environment } from '../../../../environments/environment';
import { ProductImportConfirmResult, ProductImportPreview } from '../models/product-import.model';

@Injectable({
  providedIn: 'root',
})
export class ProductImportService extends BaseService {
  constructor(http: HttpClient) {
    super(http, `${environment.apiUrl}/productos/import`);
  }

  downloadTemplate(): void {
    this.getRequestFile('/plantilla', 'plantilla-importacion-productos.xlsx');
  }

  preview(archivo: File): Observable<ResponseDto<ProductImportPreview>> {
    const formData = new FormData();
    formData.append('archivo', archivo);
    return this.postRequestForm<ResponseDto<ProductImportPreview>>('/preview', formData);
  }

  confirmar(archivo: File, almacenId: number): Observable<ResponseDto<ProductImportConfirmResult>> {
    const formData = new FormData();
    formData.append('archivo', archivo);
    formData.append('almacen_id', String(almacenId));
    return this.postRequestForm<ResponseDto<ProductImportConfirmResult>>('/confirmar', formData);
  }
}

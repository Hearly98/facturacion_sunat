import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ResponseDto } from '@shared/models/api/response.dto';
import { environment } from '@environments/environment';
import { MenuOptionDto } from '../models/menu-option.dto';
import { BaseService } from '@shared/services/base.service';

@Injectable({
  providedIn: 'root'
})
export class MenuOptionsService extends BaseService {
  constructor(http: HttpClient) {
    super(http, `${environment.apiUrl}/permissions`);
  }

  /**
   * Obtener menú en formato tree (jerárquico) basado en permisos del usuario
   */
  listTree(): Observable<ResponseDto<MenuOptionDto[]>> {
    return this.getRequest<ResponseDto<MenuOptionDto[]>>('/menu');
  }

  /**
   * Obtener permisos del usuario (códigos de acción)
   */
  getUserPermissions(): Observable<ResponseDto<string[]>> {
    return this.getRequest<ResponseDto<string[]>>('/user-permissions');
  }

  /**
   * Verificar si el usuario tiene un permiso específico
   */
  checkPermission(actionCode: string): Observable<ResponseDto<{ has_permission: boolean; action_code: string }>> {
    return this.postRequest<{ action_code: string }, ResponseDto<any>>('/check', { action_code: actionCode });
  }
}

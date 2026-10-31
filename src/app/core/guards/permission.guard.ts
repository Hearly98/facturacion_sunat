import { Injectable, inject } from '@angular/core';
import { CanActivate, CanActivateFn, ActivatedRouteSnapshot, Router, UrlTree } from '@angular/router';
import { NgxPermissionsService } from 'ngx-permissions';
import { Observable, catchError, map, of } from 'rxjs';
import { MenuOptionsNavService } from 'src/app/menu-options/services/menu-options-nav.service';

/**
 * Guard para proteger rutas basado en permisos del usuario
 * 
 * Uso en rutas:
 * ```typescript
 * {
 *   path: 'ventas/crear',
 *   component: CrearVentaComponent,
 *   canActivate: [PermissionGuard],
 *   data: { permission: 'ventas.create' }
 * }
 * ```
 */
@Injectable({
  providedIn: 'root'
})
export class PermissionGuard implements CanActivate {
  private permissionsService = inject(NgxPermissionsService);
  private router = inject(Router);

  canActivate(
    route: ActivatedRouteSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    const requiredPermission = route.data['permission'] as string;
    
    // Si no se especifica permiso, permitir acceso
    if (!requiredPermission) {
      return true;
    }

    // Verificar si el usuario tiene el permiso
    const hasPermission = this.permissionsService.getPermission(requiredPermission) !== undefined;
    
    if (!hasPermission) {
      console.warn(`Acceso denegado: permiso '${requiredPermission}' requerido`);
      // Redirigir a página de no autorizado
      return this.router.createUrlTree(['/unauthorized']);
    }

    return true;
  }
}


/**
 * Versión funcional que tolera la recarga de página: los permisos se cargan junto con el menú del
 * layout, así que al entrar directo por URL todavía no están. En ese caso los pide antes de decidir
 * en vez de negar el acceso. Sin permiso redirige al dashboard (no existe una ruta /unauthorized).
 *
 * Es solo UX: la autorización real la hace el backend (middleware permission:*).
 */
export const permissionGuard: CanActivateFn = (route) => {
  const requiredPermission = route.data['permission'] as string | undefined;
  if (!requiredPermission) {
    return true;
  }

  const permissions = inject(NgxPermissionsService);
  const router = inject(Router);
  const decide = (): boolean | UrlTree =>
    permissions.getPermission(requiredPermission) !== undefined || router.createUrlTree(['/dashboard']);

  if (Object.keys(permissions.getPermissions()).length > 0) {
    return decide();
  }

  return inject(MenuOptionsNavService)
    .loadUserPermissions()
    .pipe(
      map(decide),
      catchError(() => of(router.createUrlTree(['/dashboard']))),
    );
};

import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { NgxPermissionsService } from 'ngx-permissions';
import { Observable, firstValueFrom, isObservable, of } from 'rxjs';
import { MenuOptionsNavService } from 'src/app/menu-options/services/menu-options-nav.service';
import { permissionGuard } from './permission.guard';

describe('permissionGuard', () => {
  let loaded: Record<string, unknown>;
  let nav: jasmine.SpyObj<MenuOptionsNavService>;
  const denied = {} as UrlTree;

  const run = async (permission?: string) => {
    const route = { data: permission ? { permission } : {} } as unknown as ActivatedRouteSnapshot;
    const result = TestBed.runInInjectionContext(() => permissionGuard(route, {} as RouterStateSnapshot));
    return isObservable(result) ? firstValueFrom(result as Observable<boolean | UrlTree>) : result;
  };

  beforeEach(() => {
    loaded = {};
    nav = jasmine.createSpyObj<MenuOptionsNavService>('MenuOptionsNavService', ['loadUserPermissions']);
    nav.loadUserPermissions.and.callFake(() => {
      loaded = { 'emisiones.ver': {} };
      return of(undefined);
    });

    TestBed.configureTestingModule({
      providers: [
        { provide: NgxPermissionsService, useValue: { getPermissions: () => loaded, getPermission: (p: string) => loaded[p] } },
        { provide: MenuOptionsNavService, useValue: nav },
        { provide: Router, useValue: { createUrlTree: () => denied } },
      ],
    });
  });

  it('deja pasar si la ruta no exige permiso', async () => {
    expect(await run()).toBeTrue();
    expect(nav.loadUserPermissions).not.toHaveBeenCalled();
  });

  it('con permisos ya cargados decide sin volver a pedirlos', async () => {
    loaded = { 'emisiones.configurar': {} };

    expect(await run('emisiones.configurar')).toBeTrue();
    expect(await run('emisiones.ver')).toBe(denied);
    expect(nav.loadUserPermissions).not.toHaveBeenCalled();
  });

  it('al recargar la página espera a que lleguen los permisos antes de decidir', async () => {
    expect(await run('emisiones.ver')).toBeTrue();
    expect(nav.loadUserPermissions).toHaveBeenCalledTimes(1);
  });

  it('sin el permiso redirige fuera de la ruta', async () => {
    expect(await run('emisiones.enviar')).toBe(denied);
  });
});

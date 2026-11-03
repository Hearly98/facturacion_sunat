import { TestBed } from '@angular/core/testing';
import { firstValueFrom, of } from 'rxjs';
import { ConfirmService } from '@shared/confirm-modal/core/services/confirm-modal.service';
import { GlobalNotification } from '@shared/alerts/global-notification/global-notification';
import { ProductService } from 'src/app/products/core/services/product.service';
import { ProductoAlmacenService } from './producto-almacen.service';
import { VinculoProductoAlmacenService } from './vinculo-producto-almacen.service';

describe('VinculoProductoAlmacenService', () => {
  let service: VinculoProductoAlmacenService;
  let confirm: jasmine.Spy;
  let vincular: jasmine.Spy;
  let searchQuick: jasmine.Spy;

  beforeEach(() => {
    confirm = jasmine.createSpy('open').and.resolveTo(true);
    vincular = jasmine.createSpy('vincular').and.returnValue(of({ isValid: true }));
    searchQuick = jasmine.createSpy('searchQuick').and.returnValue(of({
      isValid: true,
      data: [
        { id: 1, label: 'ARR-001 • Arroz', vinculado: true, stock: 7 },
        { id: 2, label: 'ARR-002 • Arroz nuevo', vinculado: false, stock: 0 },
      ],
    }));
    TestBed.configureTestingModule({
      providers: [
        { provide: ConfirmService, useValue: { open: confirm } },
        { provide: ProductoAlmacenService, useValue: { vincular } },
        { provide: ProductService, useValue: { searchQuick } },
        { provide: GlobalNotification, useValue: jasmine.createSpyObj('n', ['openAlert', 'openToastAlert']) },
      ],
    });
    service = TestBed.inject(VinculoProductoAlmacenService);
  });

  it('busca incluyendo los no vinculados y los marca en el texto', async () => {
    const res: any = await firstValueFrom(service.buscarParaIngreso('Arroz', 5));

    expect(searchQuick).toHaveBeenCalledWith(jasmine.objectContaining({ term: 'Arroz', almacen_id: 5, incluir_no_vinculados: true }));
    expect(res.data[0].label).toBe('ARR-001 • Arroz');
    expect(res.data[1].label).toBe('ARR-002 • Arroz nuevo — no vinculado a este almacén');
  });

  it('un producto ya vinculado pasa sin preguntar', async () => {
    expect(await service.asegurarVinculo({ id: 1, nombre: 'Arroz', vinculado: true }, 5, 'Principal')).toBeTrue();
    expect(confirm).not.toHaveBeenCalled();
    expect(vincular).not.toHaveBeenCalled();
  });

  it('un producto no vinculado pide confirmación y lo vincula con stock 0', async () => {
    const ok = await service.asegurarVinculo({ id: 2, nombre: 'Arroz nuevo', vinculado: false }, 5, 'Principal');

    expect(ok).toBeTrue();
    expect(confirm.calls.mostRecent().args[0].message).toContain('Principal');
    expect(vincular).toHaveBeenCalledWith(2, 5);
  });

  it('si el usuario cancela no vincula ni deja elegirlo', async () => {
    confirm.and.resolveTo(false);

    expect(await service.asegurarVinculo({ id: 2, nombre: 'Arroz nuevo', vinculado: false }, 5, 'Principal')).toBeFalse();
    expect(vincular).not.toHaveBeenCalled();
  });
});

import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { KardexReportComponent } from './kardex-report';
import { KardexService } from '../../core/services/kardex.service';
import { ProductService } from '../../../products/core/services/product.service';
import { AlmacenService } from '../../../almacen/core/services/almacen.service';
import { KardexModel } from '../../core/models/kardex.model';

describe('KardexReportComponent', () => {
  let kardexService: jasmine.SpyObj<KardexService>;

  const kardex: KardexModel = { productId: 5, warehouseId: 2, openingBalance: 45, finalStock: 52, movements: [] };

  beforeEach(() => {
    kardexService = jasmine.createSpyObj('KardexService', ['getKardex']);
    kardexService.getKardex.and.returnValue(of({ isValid: true, data: kardex, messages: [] } as any));

    TestBed.configureTestingModule({
      providers: [
        provideNoopAnimations(),
        { provide: KardexService, useValue: kardexService },
        { provide: ProductService, useValue: { getAll: () => of({ isValid: true, data: [] }) } },
        { provide: AlmacenService, useValue: { getAll: () => of({ isValid: true, data: [] }) } },
      ],
    });
  });

  function create(): KardexReportComponent {
    const component = TestBed.createComponent(KardexReportComponent).componentInstance;
    component.ngOnInit();
    return component;
  }

  it('does not query until product and warehouse are selected', () => {
    const component = create();
    component.filterForm.patchValue({ productId: 5 });

    component.onSearch();

    expect(kardexService.getKardex).not.toHaveBeenCalled();
  });

  it('queries the kardex with the selected filters and keeps the result', () => {
    const component = create();
    component.filterForm.patchValue({ productId: 5, warehouseId: 2, dateFrom: '2026-10-01' });

    component.onSearch();

    expect(kardexService.getKardex).toHaveBeenCalledWith({
      productId: 5,
      warehouseId: 2,
      dateFrom: '2026-10-01',
      dateTo: null,
    });
    expect(component.kardex).toEqual(kardex);
  });

  it('clears the result when cleaning the filters', () => {
    const component = create();
    component.filterForm.patchValue({ productId: 5, warehouseId: 2 });
    component.onSearch();

    component.onClean();

    expect(component.kardex).toBeNull();
    expect(component.filterForm.value.productId).toBeNull();
  });
});

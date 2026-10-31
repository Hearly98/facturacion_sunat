import { TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { ActivatedRoute, Router, convertToParamMap } from '@angular/router';
import { BehaviorSubject, of, throwError } from 'rxjs';
import { NgxPermissionsService } from 'ngx-permissions';
import { GlobalNotification } from '@shared/alerts/global-notification/global-notification';
import { EmissionsPage } from './emissions.page';
import { EmissionService } from '../core/services/emission.service';
import { Emission } from '../core/models/emission.models';

describe('EmissionsPage', () => {
  let page: EmissionsPage;
  let service: jasmine.SpyObj<EmissionService>;
  let notification: jasmine.SpyObj<GlobalNotification>;
  const data$ = new BehaviorSubject<Record<string, unknown>>({ family: 'boletas' });
  const query$ = new BehaviorSubject(convertToParamMap({}));
  let granted: string[];

  const emission = (id: number, status: Emission['status']): Emission => ({
    id, family: 'boletas', saleId: id, documentType: '03', documentTypeName: 'Boleta', number: `B001-0000000${id}`,
    affectedDocument: null, customer: 'CLIENTES VARIOS', total: 10, status, issuedAt: null, scheduledFor: null,
    deadline: null, hoursLeft: 100, attempts: 0, nextAttemptAt: null, responseCode: null, responseDescription: null,
  });

  const create = () => {
    page = TestBed.createComponent(EmissionsPage).componentInstance;
    page.ngOnInit();
  };

  beforeEach(() => {
    granted = ['emisiones.ver', 'emisiones.enviar'];
    service = jasmine.createSpyObj<EmissionService>('EmissionService', ['list', 'summary', 'sendNow', 'sendBatch', 'download', 'detail', 'reschedule']);
    service.list.and.returnValue(of({ items: [emission(1, 'PROGRAMADA'), emission(2, 'ACEPTADA'), emission(3, 'RECHAZADA')], total: 3, page: 1, lastPage: 1 }));
    service.summary.and.returnValue(of({ total: 3, byStatus: {}, pending: 1, needsAttention: 1 }));
    notification = jasmine.createSpyObj<GlobalNotification>('GlobalNotification', ['openToastAlert']);

    TestBed.configureTestingModule({
      imports: [EmissionsPage],
      providers: [
        provideNoopAnimations(),
        { provide: EmissionService, useValue: service },
        { provide: GlobalNotification, useValue: notification },
        { provide: NgxPermissionsService, useValue: { getPermission: (p: string) => (granted.includes(p) ? { name: p } : undefined) } },
        { provide: Router, useValue: jasmine.createSpyObj('Router', ['navigate']) },
        { provide: ActivatedRoute, useValue: { data: data$, queryParamMap: query$, snapshot: { queryParamMap: convertToParamMap({}) } } },
      ],
    });
    create();
  });

  it('sin emisiones.enviar la bandeja es de solo lectura', () => {
    granted = ['emisiones.ver'];
    create();

    expect(page.canSend).toBeFalse();
    expect(page.canSendNow('PROGRAMADA')).toBeFalse();
    expect(page.selectableIds()).toEqual([]);
  });

  it('carga la familia de la ruta y su resumen', () => {
    expect(page.family()).toBe('boletas');
    expect(page.texts().title).toBe('Boletas electrónicas');
    expect(service.list).toHaveBeenCalledWith(jasmine.objectContaining({ family: 'boletas', page: 1 }));
    expect(service.summary).toHaveBeenCalledWith('boletas');
  });

  it('la misma página sirve para facturas', () => {
    data$.next({ family: 'facturas' });

    expect(page.texts().subtitle).toContain('3 días');
    expect(service.list).toHaveBeenCalledWith(jasmine.objectContaining({ family: 'facturas' }));
    data$.next({ family: 'boletas' });
  });

  it('solo se pueden seleccionar las que se pueden enviar', () => {
    expect(page.selectableIds()).toEqual([1, 3]);

    page.toggleAll();
    expect([...page.selected()]).toEqual([1, 3]);
    expect(page.allSelected()).toBeTrue();
  });

  it('envía la selección en lote y avisa cuántas se encolaron', () => {
    service.sendBatch.and.returnValue(of({ queued: 2, skipped: 0 }));
    page.toggleAll();

    page.sendSelected();

    expect(service.sendBatch).toHaveBeenCalledWith([1, 3]);
    expect(notification.openToastAlert).toHaveBeenCalledWith('Emisiones', '2 comprobantes enviados a la cola', 'info');
  });

  it('enviar ahora muestra la respuesta de SUNAT', () => {
    service.sendNow.and.returnValue(of({ ...emission(1, 'ACEPTADA'), responseDescription: 'aceptada', observations: [], hash: 'H', hasXml: true, hasCdr: true, history: [] }));

    page.sendNow(emission(1, 'PROGRAMADA'));

    expect(notification.openToastAlert).toHaveBeenCalledWith('B001-00000001: Aceptada', 'aceptada', 'success');
    expect(page.sendingId()).toBeNull();
  });

  it('un error de negocio se muestra sin romper la pantalla', () => {
    service.sendNow.and.returnValue(throwError(() => ({ error: { message: 'Ya fue aceptado' } })));

    page.sendNow(emission(1, 'PROGRAMADA'));

    expect(notification.openToastAlert).toHaveBeenCalledWith('B001-00000001', 'Ya fue aceptado', 'danger');
  });

  it('los chips filtran la bandeja', () => {
    page.filterBy('', true);

    expect(service.list).toHaveBeenCalledWith(jasmine.objectContaining({ dueSoon: true, status: '' }));
  });

  it('abre el detalle que llega desde una notificación', () => {
    query$.next(convertToParamMap({ emision: '42' }));

    expect(page.detailId()).toBe(42);
  });
});

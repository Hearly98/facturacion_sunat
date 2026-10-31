import { TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { NotificationBellComponent } from './notification-bell.component';
import { AppNotification, NotificationService } from '../core/notification.service';

describe('NotificationBellComponent', () => {
  let bell: NotificationBellComponent;
  let service: jasmine.SpyObj<NotificationService>;
  let router: jasmine.SpyObj<Router>;

  const notification: AppNotification = {
    id: 'n1', type: 'emision.rechazada', level: 'critico', title: 'B001-00000015 fue rechazado', message: 'detalle',
    emissionId: 9, family: 'boletas', read: false, date: null,
  };

  beforeEach(() => {
    jasmine.clock().install();
    service = jasmine.createSpyObj<NotificationService>('NotificationService', ['unreadCount', 'list', 'markAsRead', 'markAllAsRead']);
    service.unreadCount.and.returnValue(of(3));
    service.list.and.returnValue(of([notification]));
    service.markAsRead.and.returnValue(of({}));
    service.markAllAsRead.and.returnValue(of({}));
    router = jasmine.createSpyObj<Router>('Router', ['navigate']);

    TestBed.configureTestingModule({
      imports: [NotificationBellComponent],
      providers: [provideNoopAnimations(), { provide: NotificationService, useValue: service }, { provide: Router, useValue: router }],
    });
    bell = TestBed.createComponent(NotificationBellComponent).componentInstance;
    bell.ngOnInit();
  });

  afterEach(() => jasmine.clock().uninstall());

  it('consulta el contador al iniciar y cada minuto', () => {
    expect(bell.unread()).toBe(3);
    expect(service.unreadCount).toHaveBeenCalledTimes(1);

    jasmine.clock().tick(60_000);
    expect(service.unreadCount).toHaveBeenCalledTimes(2);
  });

  it('abrir una notificación la marca leída y lleva a la emisión', () => {
    bell.loadList();

    bell.open(notification);

    expect(service.markAsRead).toHaveBeenCalledWith('n1');
    expect(bell.items()[0].read).toBeTrue();
    expect(router.navigate).toHaveBeenCalledWith(['/emisiones', 'boletas'], { queryParams: { emision: 9 } });
  });

  it('marcar todas deja el contador en cero', () => {
    bell.loadList();

    bell.markAll(new Event('click'));

    expect(bell.unread()).toBe(0);
    expect(bell.items().every((n) => n.read)).toBeTrue();
  });
});

import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { GlobalNotification } from '@shared/alerts/global-notification/global-notification';
import { SunatService } from 'src/app/sunat/core/services/sunat.service';
import { SunatConfig } from 'src/app/sunat/core/models/sunat.models';
import { SendingPolicyCardComponent } from './sending-policy-card.component';

describe('SendingPolicyCardComponent', () => {
  let card: SendingPolicyCardComponent;
  let sunat: jasmine.SpyObj<SunatService>;

  const config = (overrides: Partial<SunatConfig['policy']> = {}): SunatConfig => ({
    environment: 'prueba', autoSend: false, solUser: null, hasSolPassword: false, hasCertificate: false, certificateExpiresAt: null,
    policy: { type: 'INMEDIATO', time: '23:00', days: [], safetyMarginHours: 24, warnings: [], ...overrides },
  });

  beforeEach(() => {
    sunat = jasmine.createSpyObj<SunatService>('SunatService', ['getConfig', 'savePolicy']);
    sunat.getConfig.and.returnValue(of(config()));
    TestBed.configureTestingModule({
      imports: [SendingPolicyCardComponent],
      providers: [{ provide: SunatService, useValue: sunat }, { provide: GlobalNotification, useValue: jasmine.createSpyObj('GlobalNotification', ['openToastAlert']) }],
    });
    card = TestBed.createComponent(SendingPolicyCardComponent).componentInstance;
    card.ngOnInit();
  });

  it('carga la política actual', () => {
    expect(card.policy.type).toBe('INMEDIATO');
    expect(card.loading()).toBeFalse();
  });

  it('programado exige al menos un día', () => {
    card.policy.type = 'PROGRAMADO';
    expect(card.isValid()).toBeFalse();

    card.toggleDay(3);
    card.toggleDay(1);
    expect(card.policy.days).toEqual([1, 3]);
    expect(card.isValid()).toBeTrue();
  });

  it('al guardar muestra las advertencias del tope legal', () => {
    sunat.savePolicy.and.returnValue(of(config({ type: 'PROGRAMADO', days: [1], warnings: ['facturas se enviarán antes'] })));
    card.policy.type = 'PROGRAMADO';
    card.toggleDay(1);

    card.save();

    expect(sunat.savePolicy).toHaveBeenCalledWith(jasmine.objectContaining({ type: 'PROGRAMADO', days: [1] }), 'prueba', true);
    expect(card.warnings()).toEqual(['facturas se enviarán antes']);
  });
});

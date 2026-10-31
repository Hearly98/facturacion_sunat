import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SucursalNewEditModal } from './sucursal-new-edit-modal';

describe('SucursalNewEditModal', () => {
  let component: SucursalNewEditModal;
  let fixture: ComponentFixture<SucursalNewEditModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SucursalNewEditModal],
      providers: [provideNoopAnimations(), provideHttpClient(), provideHttpClientTesting(), provideRouter([])]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SucursalNewEditModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RolNewEditModal } from './rol-new-edit-modal';

describe('RolNewEditModal', () => {
  let component: RolNewEditModal;
  let fixture: ComponentFixture<RolNewEditModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RolNewEditModal],
      providers: [provideNoopAnimations(), provideHttpClient(), provideHttpClientTesting(), provideRouter([])]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RolNewEditModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormGroup } from '@angular/forms';

import { StateSelectcombo } from './state-selectcombo';

describe('StateSelectcombo', () => {
  let component: StateSelectcombo;
  let fixture: ComponentFixture<StateSelectcombo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StateSelectcombo],
      providers: [provideNoopAnimations(), provideHttpClient(), provideHttpClientTesting(), provideRouter([])]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StateSelectcombo);
    component = fixture.componentInstance;
    // El combo se monta sobre un control del formulario padre; sin él no hay nada que enlazar.
    component.form = new FormGroup({ estado: new FormControl(true) });
    component.formControlName = 'estado';
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

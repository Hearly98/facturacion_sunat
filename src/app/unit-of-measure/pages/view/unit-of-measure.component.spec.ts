import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UnitOfMeasurePage } from './unit-of-measure.component';

describe('UnitOfMeasurePage', () => {
  let component: UnitOfMeasurePage;
  let fixture: ComponentFixture<UnitOfMeasurePage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UnitOfMeasurePage],
      providers: [provideNoopAnimations(), provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(UnitOfMeasurePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SupplierPage } from './supplier.page';

describe('SupplierComponent', () => {
  let component: SupplierPage;
  let fixture: ComponentFixture<SupplierPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SupplierPage],
      providers: [provideNoopAnimations(), provideHttpClient(), provideHttpClientTesting(), provideRouter([])]
    })
      .compileComponents();

    fixture = TestBed.createComponent(SupplierPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

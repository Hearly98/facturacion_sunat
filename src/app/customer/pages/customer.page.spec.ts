import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomerPage } from './customer.page';

describe('CustomerComponent', () => {
  let component: CustomerPage;
  let fixture: ComponentFixture<CustomerPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomerPage],
      providers: [provideNoopAnimations(), provideHttpClient(), provideHttpClientTesting(), provideRouter([])]
    })
      .compileComponents();

    fixture = TestBed.createComponent(CustomerPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

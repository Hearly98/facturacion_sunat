import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SucursalPage } from './sucursal';

describe('SucursalPage', () => {
  let component: SucursalPage;
  let fixture: ComponentFixture<SucursalPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SucursalPage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SucursalPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

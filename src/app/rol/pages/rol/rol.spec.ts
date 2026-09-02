import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RolPage } from './rol';

describe('RolPage', () => {
  let component: RolPage;
  let fixture: ComponentFixture<RolPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RolPage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RolPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

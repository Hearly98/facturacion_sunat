import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UnitOfMeasureNewEditModalComponent } from './unit-of-measure-new-edit-modal.component';

describe('UnitOfMeasureNewEditModalComponent', () => {
  let component: UnitOfMeasureNewEditModalComponent;
  let fixture: ComponentFixture<UnitOfMeasureNewEditModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UnitOfMeasureNewEditModalComponent],
      providers: [provideNoopAnimations(), provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(UnitOfMeasureNewEditModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

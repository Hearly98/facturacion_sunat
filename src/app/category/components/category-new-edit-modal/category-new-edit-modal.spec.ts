import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CategoryNewEditModal } from './category-new-edit-modal';

describe('CategoryNewEditModal', () => {
  let component: CategoryNewEditModal;
  let fixture: ComponentFixture<CategoryNewEditModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CategoryNewEditModal],
      providers: [provideNoopAnimations(), provideHttpClient(), provideHttpClientTesting(), provideRouter([])]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CategoryNewEditModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

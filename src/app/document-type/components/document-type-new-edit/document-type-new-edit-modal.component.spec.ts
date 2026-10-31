import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DocumentTypeNewEditModalComponent } from './document-type-new-edit-modal.component';

describe('DocumentTypeNewEditModalComponent', () => {
  let component: DocumentTypeNewEditModalComponent;
  let fixture: ComponentFixture<DocumentTypeNewEditModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DocumentTypeNewEditModalComponent],
      providers: [provideNoopAnimations(), provideHttpClient(), provideHttpClientTesting(), provideRouter([])]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DocumentTypeNewEditModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

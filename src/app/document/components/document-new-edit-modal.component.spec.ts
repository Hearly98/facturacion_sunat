import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DocumentNewEditModalComponent } from './document-new-edit-modal.component';

describe('DocumentNewEditModalComponent', () => {
  let component: DocumentNewEditModalComponent;
  let fixture: ComponentFixture<DocumentNewEditModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DocumentNewEditModalComponent],
      providers: [provideNoopAnimations(), provideHttpClient(), provideHttpClientTesting(), provideRouter([])]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DocumentNewEditModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

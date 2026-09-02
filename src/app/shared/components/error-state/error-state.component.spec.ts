import { TestBed } from '@angular/core/testing';
import { ErrorStateComponent } from './error-state.component';

describe('ErrorStateComponent', () => {
  it('should create', () => {
    const fixture = TestBed.createComponent(ErrorStateComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('defaults to a generic error message and a retry label', () => {
    const component = TestBed.createComponent(ErrorStateComponent).componentInstance;

    expect(component.message).toBe('Ocurrió un error al cargar los datos');
    expect(component.retryLabel).toBe('Reintentar');
  });

  it('emits retry when the retry button is clicked', () => {
    const component = TestBed.createComponent(ErrorStateComponent).componentInstance;
    const emitSpy = spyOn(component.retry, 'emit');

    component.retry.emit();

    expect(emitSpy).toHaveBeenCalled();
  });
});

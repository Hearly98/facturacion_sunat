import { TestBed } from '@angular/core/testing';
import { EmptyStateComponent } from './empty-state.component';

describe('EmptyStateComponent', () => {
  it('should create', () => {
    const fixture = TestBed.createComponent(EmptyStateComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('defaults to "No hay datos" and no action button', () => {
    const component = TestBed.createComponent(EmptyStateComponent).componentInstance;

    expect(component.message).toBe('No hay datos');
    expect(component.actionLabel).toBe('');
  });

  it('emits action when the action button is clicked', () => {
    const component = TestBed.createComponent(EmptyStateComponent).componentInstance;
    const emitSpy = spyOn(component.action, 'emit');

    component.action.emit();

    expect(emitSpy).toHaveBeenCalled();
  });
});

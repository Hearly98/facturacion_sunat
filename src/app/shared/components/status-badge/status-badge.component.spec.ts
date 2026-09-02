import { TestBed } from '@angular/core/testing';
import { StatusBadgeComponent } from './status-badge.component';

describe('StatusBadgeComponent', () => {
  it('should create with secondary as the default color', () => {
    const component = TestBed.createComponent(StatusBadgeComponent).componentInstance;

    expect(component.color).toBe('secondary');
    expect(component.label).toBe('');
  });

  it('accepts an explicit color and label', () => {
    const fixture = TestBed.createComponent(StatusBadgeComponent);
    fixture.componentInstance.color = 'success';
    fixture.componentInstance.label = 'Activo';
    fixture.detectChanges();

    const badge: HTMLElement = fixture.nativeElement.querySelector('.badge');
    expect(badge.classList).toContain('bg-success');
    expect(badge.textContent?.trim()).toBe('Activo');
  });
});

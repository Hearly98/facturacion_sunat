import { TestBed } from '@angular/core/testing';
import { PageHeaderComponent } from './page-header.component';

describe('PageHeaderComponent', () => {
  it('should create', () => {
    const fixture = TestBed.createComponent(PageHeaderComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('does not render an action button when actionLabel is empty', () => {
    const fixture = TestBed.createComponent(PageHeaderComponent);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('button')).toBeNull();
  });

  it('emits action when the button is clicked', () => {
    const fixture = TestBed.createComponent(PageHeaderComponent);
    fixture.componentInstance.title = 'Clientes';
    fixture.componentInstance.actionLabel = 'Nuevo Cliente';
    fixture.detectChanges();

    const emitSpy = spyOn(fixture.componentInstance.action, 'emit');
    fixture.nativeElement.querySelector('button').click();

    expect(emitSpy).toHaveBeenCalled();
  });
});

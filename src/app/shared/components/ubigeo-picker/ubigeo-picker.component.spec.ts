import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { of } from 'rxjs';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { UbigeoService } from '@shared/services/ubigeo.service';
import { UbigeoPickerComponent, UbigeoSeleccionado } from './ubigeo-picker.component';

const ARBOL = [
  { codigo: '01', nombre: 'Amazonas', provincias: [
    { codigo: '0101', nombre: 'Chachapoyas', distritos: [{ codigo: '010101', nombre: 'Chachapoyas' }] },
  ] },
  { codigo: '15', nombre: 'Lima', provincias: [
    { codigo: '1501', nombre: 'Lima', distritos: [
      { codigo: '150101', nombre: 'Lima' },
      { codigo: '150104', nombre: 'Barranco' },
    ] },
    { codigo: '1502', nombre: 'Barranca', distritos: [{ codigo: '150201', nombre: 'Barranca' }] },
  ] },
];

@Component({
  standalone: true,
  imports: [ReactiveFormsModule, UbigeoPickerComponent],
  template: `<app-ubigeo-picker [formControl]="control" (selected)="ultimo = $event" />`,
})
class HostComponent {
  control = new FormControl<string | null>(null);
  ultimo: UbigeoSeleccionado | null = null;
}

@Component({
  standalone: true,
  imports: [ReactiveFormsModule, UbigeoPickerComponent],
  template: `<app-ubigeo-picker mode="inline" [formControl]="control" (selected)="ultimo = $event" />`,
})
class InlineHostComponent extends HostComponent {}

describe('UbigeoPickerComponent', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;
  let picker: UbigeoPickerComponent;

  beforeEach(async () => {
    const flat = [
      { code: '010101', label: 'Amazonas / Chachapoyas / Chachapoyas' },
      { code: '150101', label: 'Lima / Lima / Lima' },
      { code: '150104', label: 'Lima / Lima / Barranco' },
      { code: '150201', label: 'Lima / Barranca / Barranca' },
    ];
    await TestBed.configureTestingModule({
      imports: [HostComponent],
      providers: [provideNoopAnimations(), {
        provide: UbigeoService,
        useValue: {
          tree: () => of(ARBOL),
          list: () => of(flat),
          describe: (c: string) => of(flat.find((u) => u.code === c)?.label ?? null),
        },
      }],
    }).compileComponents();

    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
    picker = fixture.debugElement.children[0].componentInstance;
  });

  it('muestra el código y su descripción cuando el form ya trae un valor', () => {
    host.control.setValue('150104');
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent + picker.display()).toContain('150104 - Lima / Lima / Barranco');
  });

  it('al abrir preselecciona departamento, provincia y distrito del valor actual', () => {
    host.control.setValue('150104');
    picker.open();

    expect(picker.departamento()).toBe('15');
    expect(picker.provincia()).toBe('1501');
    expect(picker.distrito()).toBe('150104');
  });

  it('los combos van en cascada: cambiar el departamento limpia provincia y distrito', () => {
    picker.open();
    picker.onDepartamento('15');
    expect(picker.provincias().map((p) => p.codigo)).toEqual(['1501', '1502']);

    picker.onProvincia('1501');
    picker.onDistrito('150104');
    picker.onDepartamento('01');

    expect(picker.provincia()).toBeNull();
    expect(picker.distrito()).toBeNull();
    expect(picker.distritos()).toEqual([]);
  });

  it('al confirmar escribe el código calculado en el form y emite los nombres', () => {
    picker.open();
    picker.onDepartamento('15');
    picker.onProvincia('1501');
    picker.onDistrito('150104');
    picker.confirm();

    expect(host.control.value).toBe('150104');
    expect(host.control.touched).toBeTrue();
    expect(host.ultimo).toEqual({ codigo: '150104', departamento: 'Lima', provincia: 'Lima', distrito: 'Barranco' });
    expect(picker.visible()).toBeFalse();
  });

  it('no deja abrir el modal si el control está deshabilitado', () => {
    host.control.disable();
    fixture.detectChanges();
    picker.open();

    expect(picker.visible()).toBeFalse();
  });

  describe('modo inline (dentro de otros modales)', () => {
    it('sincroniza los combos con el valor del form y escribe al elegir el distrito', () => {
      const inlineFixture = TestBed.createComponent(InlineHostComponent);
      inlineFixture.detectChanges();
      const host = inlineFixture.componentInstance;
      const picker: UbigeoPickerComponent = inlineFixture.debugElement.children[0].componentInstance;
      host.control.setValue('150104');

      expect(picker.departamento()).toBe('15');
      expect(picker.provincia()).toBe('1501');

      picker.onProvincia('1502');
      picker.onDistrito('150201');

      expect(host.control.value).toBe('150201');
      expect(host.ultimo?.distrito).toBe('Barranca');
    });
  });
});

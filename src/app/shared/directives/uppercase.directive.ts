import { Directive, ElementRef, inject, OnDestroy, OnInit } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { fromEvent, Subject, takeUntil } from 'rxjs';

@Directive({
  selector: '[appUppercase]',
  standalone: true,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: UppercaseDirective,
      multi: true,
    },
  ],
})
export class UppercaseDirective implements ControlValueAccessor, OnInit, OnDestroy {
  readonly #elementRef = inject(ElementRef);
  readonly #destroy$ = new Subject<void>();

  private onChange: ((value: string) => void) | null = null;
  private onTouched: (() => void) | null = null;

  public ngOnInit(): void {
    fromEvent(this.#elementRef.nativeElement, 'input')
      .pipe(takeUntil(this.#destroy$))
      .subscribe(() => this.#handleInput());
  }

  public writeValue(value: string): void {
    const input = this.#elementRef.nativeElement as HTMLInputElement;
    input.value = value ? value.toUpperCase() : '';
  }

  public registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  public registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  public setDisabledState(isDisabled: boolean): void {
    (this.#elementRef.nativeElement as HTMLInputElement).disabled = isDisabled;
  }

  public ngOnDestroy(): void {
    this.#destroy$.next();
    this.#destroy$.complete();
  }

  #handleInput(): void {
    const input = this.#elementRef.nativeElement as HTMLInputElement;
    const upperValue = input.value.toUpperCase();

    if (input.value !== upperValue) {
      input.value = upperValue;
    }

    this.onChange?.(upperValue);
    this.onTouched?.();
  }
}

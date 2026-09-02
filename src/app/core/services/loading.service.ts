import { Injectable, signal } from '@angular/core';

const SHOW_DELAY_MS = 300;

/**
 * Loading global, con debounce: no muestra el spinner si la request completa antes de
 * SHOW_DELAY_MS (evita flicker en requests rápidas). Cuenta requests concurrentes.
 */
@Injectable({ providedIn: 'root' })
export class LoadingService {
  private readonly _loading = signal(false);
  readonly loading = this._loading.asReadonly();

  private timer: ReturnType<typeof setTimeout> | null = null;
  private requestCount = 0;

  show(): void {
    this.requestCount++;
    if (this.requestCount === 1) {
      this.timer = setTimeout(() => {
        if (this.requestCount > 0) {
          this._loading.set(true);
        }
      }, SHOW_DELAY_MS);
    }
  }

  hide(): void {
    this.requestCount = Math.max(0, this.requestCount - 1);
    if (this.requestCount === 0) {
      if (this.timer) {
        clearTimeout(this.timer);
        this.timer = null;
      }
      this._loading.set(false);
    }
  }
}

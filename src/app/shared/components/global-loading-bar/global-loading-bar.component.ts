import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoadingService } from 'src/app/core/services/loading.service';

/**
 * Barra de carga global, fina, fija arriba de la ventana. Se muestra cuando
 * LoadingService.loading() es true (con su propio debounce de 300ms). Montada una vez
 * en app.html, no requiere que cada página la agregue.
 */
@Component({
  selector: 'app-global-loading-bar',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (loading()) {
      <div class="global-loading-bar" role="progressbar" aria-label="Cargando"></div>
    }
  `,
  styles: `
    .global-loading-bar {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      height: 3px;
      z-index: 2000;
      background: linear-gradient(90deg, #0d6efd, #6ea8fe, #0d6efd);
      background-size: 200% 100%;
      animation: global-loading-bar-sweep 1.2s linear infinite;
    }
    @keyframes global-loading-bar-sweep {
      0% {
        background-position: 200% 0;
      }
      100% {
        background-position: -200% 0;
      }
    }
  `,
})
export class GlobalLoadingBarComponent {
  private readonly loadingService = inject(LoadingService);
  readonly loading = this.loadingService.loading;
}

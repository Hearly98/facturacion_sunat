//Angular
import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZoneChangeDetection,
  APP_INITIALIZER,
  importProvidersFrom,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

// Third-party
import { SidebarModule } from '@coreui/angular';
import { NgxPermissionsModule } from 'ngx-permissions';
import { inject as vercelInject } from '@vercel/analytics';

// Alias
import { environment } from '@environments/environment';

// Relative
import { routes } from './app.routes';
import { authInterceptor } from './core/auth/interceptor/auth.interceptor';
import { errorInterceptor } from './core/auth/interceptor/error.interceptor';
import { loadingInterceptor } from './core/interceptors/loading.interceptor';
import { AppInitializerService } from './core/services/app-initializer.service';

/**
 * Factory function para inicializar la aplicación
 * Carga los permisos del usuario si hay una sesión activa
 */
export function initializeApp(appInitializer: AppInitializerService) {
  return () => appInitializer.initialize();
}

export function initializeAnalytics() {
  return () => {
    try {
      if (environment.production) {
        vercelInject();
      }
    } catch (error) {
      console.warn('Vercel Analytics failed to initialize', error);
    }
  };
}
export const appConfig: ApplicationConfig = {
  providers: [
    importProvidersFrom(SidebarModule, NgxPermissionsModule.forRoot()),
    provideHttpClient(withInterceptors([authInterceptor, errorInterceptor, loadingInterceptor])),
    provideAnimationsAsync(),
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    {
      provide: APP_INITIALIZER,
      useFactory: initializeApp,
      deps: [AppInitializerService],
      multi: true,
    },
    {
      provide: APP_INITIALIZER,
      useFactory: initializeAnalytics,
      multi: true,
    },
  ],
};

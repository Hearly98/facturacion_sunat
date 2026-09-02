import { HttpInterceptorFn } from '@angular/common/http';
import { finalize } from 'rxjs';
import { inject } from '@angular/core';
import { LoadingService } from '../services/loading.service';

/**
 * Header para excluir una request puntual del loading global, ej. polling silencioso:
 *   this.http.get(url, { headers: { 'X-Skip-Loading': '1' } })
 */
export const SKIP_LOADING_HEADER = 'X-Skip-Loading';

export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.headers.has(SKIP_LOADING_HEADER)) {
    return next(req.clone({ headers: req.headers.delete(SKIP_LOADING_HEADER) }));
  }

  const loadingService = inject(LoadingService);
  loadingService.show();

  return next(req).pipe(finalize(() => loadingService.hide()));
};

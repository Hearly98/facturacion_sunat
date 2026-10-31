import { HttpResponse } from '@angular/common/http';

/**
 * Descarga un archivo recibido como blob, usando el nombre del Content-Disposition si viene.
 */
export function downloadBlobResponse(response: HttpResponse<Blob>, fallbackName: string): void {
  const disposition = response.headers.get('content-disposition');
  const match = disposition?.match(/filename="?([^";\n]*)"?/);
  const filename = match?.[1] || fallbackName;

  const url = window.URL.createObjectURL(response.body as Blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.URL.revokeObjectURL(url);
}

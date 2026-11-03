import { Injectable, inject } from '@angular/core';
import { firstValueFrom, map, Observable } from 'rxjs';
import { ConfirmService } from '@shared/confirm-modal/core/services/confirm-modal.service';
import { GlobalNotification } from '@shared/alerts/global-notification/global-notification';
import { ProductService } from 'src/app/products/core/services/product.service';
import { ProductoAlmacenService } from './producto-almacen.service';

const MARCA_NO_VINCULADO = ' — no vinculado a este almacén';

/**
 * Un producto solo se mueve en almacenes donde está vinculado (producto_almacen). En compras e
 * ingresos el buscador antes ocultaba los no vinculados sin explicar por qué; ahora los muestra
 * marcados y, al elegir uno, ofrece vincularlo en el momento.
 */
@Injectable({ providedIn: 'root' })
export class VinculoProductoAlmacenService {
  readonly #productService = inject(ProductService);
  readonly #productoAlmacen = inject(ProductoAlmacenService);
  readonly #confirm = inject(ConfirmService);
  readonly #notification = inject(GlobalNotification);

  buscarParaIngreso(term: string, almacenId: number): Observable<any> {
    return this.#productService
      .searchQuick({ term, almacen_id: almacenId, incluir_no_vinculados: true })
      .pipe(
        map((res: any) => ({
          ...res,
          data: (res.data ?? []).map((p: any) =>
            p.vinculado === false ? { ...p, label: `${p.label ?? p.nombre}${MARCA_NO_VINCULADO}` } : p,
          ),
        })),
      );
  }

  /** true si el producto ya está (o quedó) vinculado; false si el usuario no quiso vincularlo. */
  async asegurarVinculo(producto: any, almacenId: number, almacenNombre: string): Promise<boolean> {
    if (producto?.vinculado !== false) return true;

    const confirmado = await this.#confirm.open({
      title: 'Producto no vinculado',
      message: `«${producto.nombre}» todavía no está vinculado al almacén <strong>${almacenNombre}</strong>.<br>¿Vincularlo ahora para registrar su ingreso?`,
      color: 'warning',
      confirmText: 'Vincular',
      cancelText: 'Cancelar',
    });
    if (!confirmado) return false;

    const res: any = await firstValueFrom(this.#productoAlmacen.vincular(producto.id, almacenId));
    if (!res?.isValid) {
      this.#notification.openAlert(res);
      return false;
    }
    return true;
  }
}

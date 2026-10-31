import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from 'src/environments/environment';

export type NotificationLevel = 'critico' | 'advertencia' | 'info';

export interface AppNotification {
  id: string;
  type: string | null;
  level: NotificationLevel;
  title: string;
  message: string;
  emissionId: number | null;
  family: 'boletas' | 'facturas' | null;
  read: boolean;
  date: string | null;
}

interface AppNotificationDto {
  id: string;
  tipo: string | null;
  nivel: NotificationLevel;
  titulo: string;
  mensaje: string;
  emision_id: number | null;
  familia: 'boletas' | 'facturas' | null;
  leida: boolean;
  fecha: string | null;
}

/** Notificaciones del usuario en la empresa activa (`/notificaciones`). */
@Injectable({ providedIn: 'root' })
export class NotificationService {
  readonly #http = inject(HttpClient);
  readonly #api = `${environment.apiUrl}/notificaciones`;

  unreadCount(): Observable<number> {
    return this.#http.get<{ data: { no_leidas: number } }>(`${this.#api}/contador`).pipe(map(({ data }) => data.no_leidas));
  }

  list(onlyUnread = false): Observable<AppNotification[]> {
    const params: Record<string, string> = { per_page: '15' };
    if (onlyUnread) params['no_leidas'] = '1';
    return this.#http.get<{ data: AppNotificationDto[] }>(this.#api, { params }).pipe(
      map(({ data }) =>
        data.map((n) => ({
          id: n.id,
          type: n.tipo,
          level: n.nivel,
          title: n.titulo,
          message: n.mensaje,
          emissionId: n.emision_id,
          family: n.familia,
          read: n.leida,
          date: n.fecha,
        })),
      ),
    );
  }

  markAsRead(id: string): Observable<unknown> {
    return this.#http.post(`${this.#api}/${id}/leida`, {});
  }

  markAllAsRead(): Observable<unknown> {
    return this.#http.post(`${this.#api}/leer-todas`, {});
  }
}

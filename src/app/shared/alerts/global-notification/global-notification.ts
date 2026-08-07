import { Injectable, signal } from "@angular/core";
import { ResponseBaseDto } from "../../models/api/response-base.dto";
import { ApplicationMessage } from "../../models/api/application-message.dto";
import { ToastColor, ToastItem } from "../toast/toast.model";

const DEFAULT_DELAY = 5000;
const EXIT_ANIMATION_MS = 300;

@Injectable({
  providedIn: "root",
})
export class GlobalNotification {
  private nextId = 0;

  readonly toasts = signal<ToastItem[]>([]);

  openToastAlert(
    title: string,
    message: string,
    color: ToastColor = "info",
  ): void {
    const id = this.nextId++;
    const toast: ToastItem = {
      id,
      title,
      message,
      color,
      closeButton: true,
      leaving: false,
    };

    this.toasts.update((items) => [...items, toast]);
    setTimeout(() => this.dismiss(id), DEFAULT_DELAY);
  }

  dismiss(id: number): void {
    const toast = this.toasts().find((t) => t.id === id);
    if (!toast || toast.leaving) return;

    this.toasts.update((items) =>
      items.map((t) => (t.id === id ? { ...t, leaving: true } : t)),
    );

    setTimeout(() => {
      this.toasts.update((items) => items.filter((t) => t.id !== id));
    }, EXIT_ANIMATION_MS);
  }

  openAlert(response: ResponseBaseDto, timeOut = 500): void {
    if (response == null) return;
    if (response.Messages == null && response.messages == null) return;
    const messages = response.Messages ?? response.messages;

    messages.forEach((message: ApplicationMessage, index: number) => {
      let title = "Información";
      let color: ToastColor = "info";

      const MessageType = message.MessageType ?? message.messageType;
      switch (MessageType) {
        case 0:
          title = "¡Éxito!";
          color = "success";
          break;
        case 1:
          title = "Información";
          color = "info";
          break;
        case 2:
          title = "Advertencia";
          color = "warning";
          break;
        case 3:
          title = "Error";
          color = "danger";
          break;
      }

      const Message = message.Message ?? message.message;
      if (Message) {
        setTimeout(() => {
          this.openToastAlert(title, Message as string, color);
        }, index * (timeOut + 500));
      }
    });
  }
}

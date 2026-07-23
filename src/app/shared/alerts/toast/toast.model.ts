export type ToastColor = 'success' | 'info' | 'warning' | 'danger';

export interface ToastItem {
  id: number;
  title: string;
  message: string;
  color: ToastColor;
  closeButton: boolean;
  leaving: boolean;
}

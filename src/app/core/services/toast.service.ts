import { Injectable, signal } from '@angular/core';

export interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  // Use a signal to store the list of toasts
  private toastsSignal = signal<Toast[]>([]);

  // Expose a readonly version of the signal
  readonly toasts = this.toastsSignal.asReadonly();

  private counter = 0;

  constructor() {}

  success(message: string, duration: number = 5000): void {
    this.show({
      id: ++this.counter,
      message,
      type: 'success',
      duration
    });
  }

  error(message: string, duration: number = 5000): void {
    this.show({
      id: ++this.counter,
      message,
      type: 'error',
      duration
    });
  }

  info(message: string, duration: number = 5000): void {
    this.show({
      id: ++this.counter,
      message,
      type: 'info',
      duration
    });
  }

  warning(message: string, duration: number = 5000): void {
    this.show({
      id: ++this.counter,
      message,
      type: 'warning',
      duration
    });
  }

  private show(toast: Toast): void {
    // Add the toast to the array
    this.toastsSignal.update(toasts => [...toasts, toast]);

    // Set a timeout to remove the toast
    if (toast.duration !== 0) {
      setTimeout(() => {
        this.remove(toast.id);
      }, toast.duration);
    }
  }

  remove(id: number): void {
    this.toastsSignal.update(toasts => toasts.filter(t => t.id !== id));
  }

  clear(): void {
    this.toastsSignal.set([]);
  }
}

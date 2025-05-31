import {Injectable} from '@angular/core';

export interface ConfirmDialogConfig {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'default' | 'destructive' | 'warning';
}

@Injectable({
  providedIn: 'root'
})
export class ConfirmDialogService {

  async confirm(
    title: string,
    message: string,
    confirmText: string = 'Confirm',
    cancelText: string = 'Cancel',
    type: 'default' | 'destructive' | 'warning' = 'default'
  ): Promise<boolean> {
    // This is a simple implementation using browser confirm
    // In a real app, you'd use a modal component
    return new Promise((resolve) => {
      const result = window.confirm(`${title}\n\n${message}`);
      resolve(result);
    });
  }

  async confirmDestructive(
    title: string,
    message: string,
    confirmText: string = 'Delete'
  ): Promise<boolean> {
    return this.confirm(title, message, confirmText, 'Cancel', 'destructive');
  }
}

import {Component, OnInit, inject, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule} from '@angular/router';
import {FormBuilder, FormGroup, ReactiveFormsModule} from '@angular/forms';
import {HttpClient} from '@angular/common/http';
import {ToastService} from '../../../../core/services/toast.service';

interface NotificationSetting {
  id: string;
  title: string;
  description: string;
  emailEnabled: boolean;
  smsEnabled: boolean;
  appEnabled: boolean;
}

@Component({
  selector: 'app-notification-settings',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: 'notification-settings.component.html',
  styles: []
})
export class NotificationSettingsComponent implements OnInit {
  private fb = inject(FormBuilder);
  private http = inject(HttpClient);
  private toastService = inject(ToastService);

  // Reactive state with signals
  protected isLoading = signal(true);
  protected isSaving = signal(false);

  // Form group
  protected notificationForm!: FormGroup;

  // Notification settings
  protected notificationSettings: NotificationSetting[] = [
    {
      id: 'order_updates',
      title: 'Order Updates',
      description: 'Receive notifications when order status changes',
      emailEnabled: true,
      smsEnabled: true,
      appEnabled: true
    },
    {
      id: 'product_updates',
      title: 'Product Updates',
      description: 'Receive notifications about inventory changes and price updates',
      emailEnabled: true,
      smsEnabled: false,
      appEnabled: true
    },
    {
      id: 'customer_activity',
      title: 'Customer Activity',
      description: 'Receive notifications about new customer registrations and reviews',
      emailEnabled: true,
      smsEnabled: false,
      appEnabled: true
    },
    {
      id: 'promotions',
      title: 'Promotions & Marketing',
      description: 'Receive notifications about promotions, discounts, and marketing campaigns',
      emailEnabled: false,
      smsEnabled: false,
      appEnabled: true
    },
    {
      id: 'system_alerts',
      title: 'System Alerts',
      description: 'Receive notifications about system maintenance and important updates',
      emailEnabled: true,
      smsEnabled: true,
      appEnabled: true
    }
  ];

  ngOnInit(): void {
    this.initForm();
    this.loadNotificationSettings();
  }

  private initForm(): void {
    // Create a form with dynamic controls for each notification setting
    const formGroup: any = {
      email_frequency: ['daily'],
      push_enabled: [false]
    };

    // Add controls for each notification setting type
    this.notificationSettings.forEach(setting => {
      formGroup[`${setting.id}_email`] = [setting.emailEnabled];
      formGroup[`${setting.id}_sms`] = [setting.smsEnabled];
      formGroup[`${setting.id}_app`] = [setting.appEnabled];
    });

    this.notificationForm = this.fb.group(formGroup);

    // Listen for push notification changes
    this.notificationForm.get('push_enabled')?.valueChanges.subscribe(
      enabled => this.handlePushChange(enabled)
    );
  }

  private loadNotificationSettings(): void {
    this.isLoading.set(true);

    // In a real application, you would fetch the notification settings from the API
    // For this example, we'll simulate a delay and then use the default values
    setTimeout(() => {
      // Update form with values from API
      const formValue: any = {
        email_frequency: 'daily',
        push_enabled: false
      };

      // Set values for each notification setting
      this.notificationSettings.forEach(setting => {
        formValue[`${setting.id}_email`] = setting.emailEnabled;
        formValue[`${setting.id}_sms`] = setting.smsEnabled;
        formValue[`${setting.id}_app`] = setting.appEnabled;
      });

      this.notificationForm.patchValue(formValue);
      this.isLoading.set(false);
    }, 800);
  }

  protected onSubmit(): void {
    if (this.notificationForm.invalid) {
      return;
    }

    this.isSaving.set(true);

    // In a real application, you would send the form data to the API
    // For this example, we'll simulate a delay and then show a success message
    setTimeout(() => {
      this.isSaving.set(false);
      this.toastService.success('Notification settings saved successfully');
    }, 800);
  }

  protected resetForm(): void {
    // Reset form to original values from the server
    this.loadNotificationSettings();
  }

  protected isPushEnabled(): boolean {
    return this.notificationForm?.get('push_enabled')?.value || false;
  }

  private handlePushChange(enabled: boolean): void {
    if (enabled) {
      // In a real application, you would request browser notification permission
      // and register the device for push notifications
      console.log('Push notifications enabled');
    } else {
      // In a real application, you would unregister the device from push notifications
      console.log('Push notifications disabled');
    }
  }
}

import {Component, OnInit, inject, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule} from '@angular/router';
import {FormBuilder, FormGroup, ReactiveFormsModule} from '@angular/forms';
import {HttpClient} from '@angular/common/http';
import {ToastService} from '../../../../core/services/toast.service';
import {ThemeService} from '../../../../core/services/theme.service';

interface ThemeOption {
  id: string;
  name: string;
  preview: string;
}

@Component({
  selector: 'app-appearance-settings',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: 'appearance-settings.component.html',
  styles: []
})
export class AppearanceSettingsComponent implements OnInit {
  private fb = inject(FormBuilder);
  private http = inject(HttpClient);
  private themeService = inject(ThemeService);
  private toastService = inject(ToastService);

  // Reactive state with signals
  protected isLoading = signal(true);
  protected isSaving = signal(false);
  protected previewClass = signal('');

  // Form group
  protected appearanceForm!: FormGroup;

  ngOnInit(): void {
    this.initForm();
    this.loadAppearanceSettings();
  }

  private initForm(): void {
    this.appearanceForm = this.fb.group({
      theme: ['system'],
      density: ['comfortable'],
      animations: [true],
      sidebarCollapsed: [false]
    });

    // Update preview when theme changes
    this.appearanceForm.get('theme')?.valueChanges.subscribe(
      theme => this.updatePreview(theme)
    );
  }

  private loadAppearanceSettings(): void {
    this.isLoading.set(true);

    // In a real application, you would fetch the appearance settings from the API
    // For this example, we'll simulate a delay and then use default values
    setTimeout(() => {
      const currentTheme = this.themeService.theme();

      this.appearanceForm.patchValue({
        theme: currentTheme === 'dark' ? 'dark' : 'light',
        density: 'comfortable',
        animations: true,
        sidebarCollapsed: false
      });

      this.updatePreview(this.appearanceForm.get('theme')?.value);
      this.isLoading.set(false);
    }, 800);
  }

  protected selectTheme(theme: string): void {
    this.appearanceForm.patchValue({theme});
    this.updatePreview(theme);
  }

  protected selectDensity(density: string): void {
    this.appearanceForm.patchValue({density});
  }

  protected updatePreview(theme: string): void {
    switch (theme) {
      case 'light':
        this.previewClass.set('');
        break;
      case 'dark':
        this.previewClass.set('dark');
        break;
      case 'system':
        // In a real application, you would check the system theme
        // For this example, we'll use the current theme
        this.previewClass.set(this.themeService.theme() === 'dark' ? 'dark' : '');
        break;
    }
  }

  protected resetForm(): void {
    this.loadAppearanceSettings();
  }

  protected saveSettings(): void {
    this.isSaving.set(true);

    const settings = this.appearanceForm.value;

    // Apply theme changes immediately
    if (settings.theme === 'light') {
      this.themeService.setTheme('light');
    } else if (settings.theme === 'dark') {
      this.themeService.setTheme('dark');
    } else {
      // System theme - use device preference
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        this.themeService.setTheme('dark');
      } else {
        this.themeService.setTheme('light');
      }
    }

    // In a real application, you would send the form data to the API
    // For this example, we'll simulate a delay and then show a success message
    setTimeout(() => {
      this.isSaving.set(false);
      this.toastService.success('Appearance settings saved successfully');
    }, 800);
  }
}

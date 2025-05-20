import { DOCUMENT } from '@angular/common';
import { Injectable, inject, signal } from '@angular/core';

type Theme = 'light' | 'dark';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private document = inject(DOCUMENT);
  private window = this.document.defaultView;
  private storageKey = 'afrisup_theme';

  // Signal to track current theme
  private themeSignal = signal<Theme>('light');

  // Expose readable signal
  readonly theme = this.themeSignal.asReadonly();

  constructor() {
    this.initTheme();
  }

  toggleTheme(): void {
    const newTheme = this.themeSignal() === 'light' ? 'dark' : 'light';
    this.setTheme(newTheme);
  }

  setTheme(theme: Theme): void {
    // Update signal
    this.themeSignal.set(theme);

    // Update DOM
    if (theme === 'dark') {
      this.document.documentElement.classList.add('dark');
    } else {
      this.document.documentElement.classList.remove('dark');
    }

    // Save to localStorage
    localStorage.setItem(this.storageKey, theme);
  }

  private initTheme(): void {
    // Check localStorage first
    const savedTheme = localStorage.getItem(this.storageKey) as Theme | null;

    // If a theme was saved in localStorage, use that
    if (savedTheme) {
      this.setTheme(savedTheme);
      return;
    }

    // Otherwise, check for OS preference
    if (this.window?.matchMedia('(prefers-color-scheme: dark)').matches) {
      this.setTheme('dark');
    } else {
      this.setTheme('light');
    }

    // Listen for OS theme changes
    this.window?.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
      if (!localStorage.getItem(this.storageKey)) {
        this.setTheme(e.matches ? 'dark' : 'light');
      }
    });
  }
}

import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../auth/services/auth.service';
import { ThemeService } from '../../services/theme.service';
import { User } from '../../auth/models/user.model';
import {toObservable} from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header.component.html',
  styles: []
})
export class HeaderComponent {
  @Input() sidebarCollapsed = false;
  @Output() toggleSidebar = new EventEmitter<void>();

  private authService = inject(AuthService);
  protected themeService = inject(ThemeService);

  protected userMenuOpen = false;
  protected user: User | null = null;

  constructor() {
    // Subscribe to user changes
    toObservable(this.authService.user).subscribe(user => {
      this.user = user;
    });
  }

  protected toggleUserMenu(): void {
    this.userMenuOpen = !this.userMenuOpen;

    // Close menu when clicking outside
    if (this.userMenuOpen) {
      setTimeout(() => {
        document.addEventListener('click', this.closeUserMenu);
      });
    }
  }

  private closeUserMenu = (event: MouseEvent): void => {
    this.userMenuOpen = false;
    document.removeEventListener('click', this.closeUserMenu);
  };

  protected logout(): void {
    this.authService.logout().subscribe();
  }

  protected getUserInitialAvatar(): string {
    // If user has a name, create an avatar with initials
    const name = this.user?.name || 'User';
    const initials = name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);

    // Return a data URL for an SVG with the initials
    return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><rect width="32" height="32" fill="%2316a34a"/><text x="16" y="20" font-size="12" font-family="Arial" text-anchor="middle" fill="white">${initials}</text></svg>`;
  }
}

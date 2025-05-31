import {Component, inject, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule} from '@angular/router';
import {AuthService} from '../../auth/services/auth.service';
import {SidebarComponent} from '../sidebar/sidebar.component';
import {HeaderComponent} from '../header/header.component';
import {FooterComponent} from '../footer/footer.component';
import {ThemeService} from '../../services/theme.service';
import {ToastContainerComponent} from '../../../shared/components/toast-container/toast-container.component';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    SidebarComponent,
    HeaderComponent,
    FooterComponent,
    ToastContainerComponent
  ],
  template: `
    <div class="h-screen flex flex-col bg-gray-50 dark:bg-dark-bg-primary text-gray-900 dark:text-dark-text-primary">
      <!-- Header -->
      <app-header
        [sidebarCollapsed]="sidebarCollapsed()"
        (toggleSidebar)="toggleSidebar()"
      ></app-header>

      <div class="flex flex-1 overflow-hidden">
        <!-- Sidebar -->
        <app-sidebar [collapsed]="sidebarCollapsed()"></app-sidebar>

        <!-- Main Content -->
        <main class="flex-1 overflow-y-auto p-4 md:p-6">
          <router-outlet></router-outlet>
        </main>
      </div>

      <!-- Footer -->
      <app-footer></app-footer>

      <!-- Toast Container -->
      <app-toast-container></app-toast-container>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      height: 100vh;
      width: 100vw;
    }
  `]
})
export class MainLayoutComponent {
  private authService = inject(AuthService);
  private themeService = inject(ThemeService);

  // Reactive state with signals
  protected sidebarCollapsed = signal<boolean>(false);

  toggleSidebar(): void {
    this.sidebarCollapsed.update(value => !value);
  }
}

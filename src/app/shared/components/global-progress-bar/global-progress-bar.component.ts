import { Component, Input, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-global-progress-bar',
  imports: [CommonModule],
  templateUrl: './global-progress-bar.component.html',
  styleUrl: './global-progress-bar.component.css'
})
export class GlobalProgressBarComponent {
  @Input() progress = signal(0);
  @Input() message = signal('Uploading...');
  @Input() visible = signal(false);

  protected progressWidth = computed(() => `${this.progress()}%`);
  protected isCompleted = computed(() => this.progress() >= 100);

  protected getProgressBarClass(): string {
    const prog = this.progress();
    if (prog >= 100) return 'bg-green-500';
    if (prog > 0) return 'bg-blue-500';
    return 'bg-gray-300';
  }
}

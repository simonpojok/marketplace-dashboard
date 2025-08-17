import { Component, Input, Output, EventEmitter, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductVideo } from '../../models/product-video.model';
import { ProductVideoService } from '../../services/product-video.service';

export type VideoSize = 'small' | 'medium' | 'large' | 'full';

@Component({
  selector: 'app-product-video-preview',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './product-video-preview.component.html',
  styleUrls: ['./product-video-preview.component.scss']
})
export class ProductVideoPreviewComponent implements OnInit, OnDestroy {
  @Input() video!: ProductVideo;
  @Input() size: VideoSize = 'medium';
  @Input() showControls: boolean = true;
  @Input() autoplay: boolean = false;
  @Input() muted: boolean = false;
  @Input() loop: boolean = false;
  @Input() preload: 'none' | 'metadata' | 'auto' = 'metadata';
  @Input() clickToPlay: boolean = false;
  @Input() showOverlay: boolean = true;
  @Input() showDuration: boolean = true;
  @Input() showTitle: boolean = false;
  @Input() lazy: boolean = true;
  @Output() videoClick = new EventEmitter<ProductVideo>();
  @Output() videoPlay = new EventEmitter<ProductVideo>();
  @Output() videoPause = new EventEmitter<ProductVideo>();
  @Output() videoEnded = new EventEmitter<ProductVideo>();
  @Output() videoError = new EventEmitter<{video: ProductVideo, error: any}>();

  private videoService = inject(ProductVideoService);

  // Component state
  protected isPlaying = signal(false);
  protected isLoading = signal(false);
  protected hasError = signal(false);
  protected errorMessage = signal<string | null>(null);
  protected currentTime = signal(0);
  protected duration = signal(0);
  protected isVisible = signal(false);
  protected hasLoadedMetadata = signal(false);

  // Video element reference
  private videoElement: HTMLVideoElement | null = null;
  private intersectionObserver: IntersectionObserver | null = null;

  ngOnInit(): void {
    if (this.lazy) {
      this.setupIntersectionObserver();
    } else {
      this.isVisible.set(true);
    }
  }

  ngOnDestroy(): void {
    this.cleanupObserver();
    this.pauseVideo();
  }

  private setupIntersectionObserver(): void {
    if (typeof IntersectionObserver === 'undefined') {
      // Fallback for environments without IntersectionObserver
      this.isVisible.set(true);
      return;
    }

    this.intersectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            this.isVisible.set(true);
            this.cleanupObserver();
          }
        });
      },
      { threshold: 0.1 }
    );
  }

  private cleanupObserver(): void {
    if (this.intersectionObserver) {
      this.intersectionObserver.disconnect();
      this.intersectionObserver = null;
    }
  }

  protected onVideoElementCreated(videoElement: HTMLVideoElement): void {
    this.videoElement = videoElement;
    
    if (this.intersectionObserver && videoElement.parentElement) {
      this.intersectionObserver.observe(videoElement.parentElement);
    }
  }

  protected onVideoClick(): void {
    if (this.clickToPlay) {
      this.togglePlayPause();
    }
    this.videoClick.emit(this.video);
  }

  protected onPlay(): void {
    this.isPlaying.set(true);
    this.videoPlay.emit(this.video);
  }

  protected onPause(): void {
    this.isPlaying.set(false);
    this.videoPause.emit(this.video);
  }

  protected onEnded(): void {
    this.isPlaying.set(false);
    this.videoEnded.emit(this.video);
  }

  protected onError(event: any): void {
    this.hasError.set(true);
    this.errorMessage.set('Failed to load video');
    this.isLoading.set(false);
    this.videoError.emit({ video: this.video, error: event });
  }

  protected onLoadStart(): void {
    this.isLoading.set(true);
    this.hasError.set(false);
    this.errorMessage.set(null);
  }

  protected onLoadedMetadata(): void {
    this.hasLoadedMetadata.set(true);
    if (this.videoElement) {
      this.duration.set(this.videoElement.duration);
    }
  }

  protected onCanPlay(): void {
    this.isLoading.set(false);
  }

  protected onTimeUpdate(): void {
    if (this.videoElement) {
      this.currentTime.set(this.videoElement.currentTime);
    }
  }

  protected togglePlayPause(): void {
    if (!this.videoElement || this.hasError()) return;

    if (this.isPlaying()) {
      this.pauseVideo();
    } else {
      this.playVideo();
    }
  }

  protected playVideo(): void {
    if (this.videoElement && !this.hasError()) {
      this.videoElement.play().catch(error => {
        console.error('Failed to play video:', error);
        this.onError(error);
      });
    }
  }

  protected pauseVideo(): void {
    if (this.videoElement && !this.videoElement.paused) {
      this.videoElement.pause();
    }
  }

  protected seekTo(time: number): void {
    if (this.videoElement && this.hasLoadedMetadata()) {
      this.videoElement.currentTime = Math.max(0, Math.min(time, this.duration()));
    }
  }

  protected getVideoSrc(): string {
    return this.video.video_file || '';
  }

  protected getVideoPoster(): string | undefined {
    return this.video.thumbnail_url;
  }

  protected getSizeClasses(): string {
    const baseClasses = 'video-preview';
    const sizeClasses = {
      small: 'video-small',
      medium: 'video-medium', 
      large: 'video-large',
      full: 'video-full'
    };
    
    return `${baseClasses} ${sizeClasses[this.size]}`;
  }

  protected getContainerClasses(): string {
    let classes = 'video-container';
    
    if (this.clickToPlay) {
      classes += ' clickable';
    }
    
    if (this.isPlaying()) {
      classes += ' playing';
    }
    
    if (this.isLoading()) {
      classes += ' loading';
    }
    
    if (this.hasError()) {
      classes += ' error';
    }
    
    return classes;
  }

  protected formatTime(seconds: number): string {
    return this.videoService.formatDuration(seconds);
  }

  protected formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  protected getProgress(): number {
    const duration = this.duration();
    const current = this.currentTime();
    return duration > 0 ? (current / duration) * 100 : 0;
  }

  protected shouldShowControls(): boolean {
    return this.showControls && !this.hasError() && this.hasLoadedMetadata();
  }

  protected shouldShowOverlay(): boolean {
    return this.showOverlay && !this.isPlaying() && !this.hasError();
  }

  protected shouldShowDuration(): boolean {
    return this.showDuration && this.duration() > 0;
  }

  protected shouldShowTitle(): boolean {
    return this.showTitle && !!this.video.title;
  }

  protected shouldLoadVideo(): boolean {
    return this.isVisible() || !this.lazy;
  }

  // Accessibility helpers
  protected getAriaLabel(): string {
    const state = this.isPlaying() ? 'playing' : 'paused';
    const duration = this.formatTime(this.video.duration);
    return `Video: ${this.video.title}, ${state}, duration ${duration}`;
  }

  protected getPlayButtonAriaLabel(): string {
    return this.isPlaying() ? 'Pause video' : 'Play video';
  }

  // Keyboard navigation
  protected onKeyDown(event: KeyboardEvent): void {
    if (!this.videoElement || this.hasError()) return;

    switch (event.key) {
      case ' ':
      case 'Enter':
        event.preventDefault();
        this.togglePlayPause();
        break;
      case 'ArrowLeft':
        event.preventDefault();
        this.seekTo(this.currentTime() - 10);
        break;
      case 'ArrowRight':
        event.preventDefault();
        this.seekTo(this.currentTime() + 10);
        break;
      case 'Home':
        event.preventDefault();
        this.seekTo(0);
        break;
      case 'End':
        event.preventDefault();
        this.seekTo(this.duration());
        break;
    }
  }
}
import { Component, Input, OnInit, OnDestroy, ChangeDetectionStrategy, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-tiktok-player',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tiktok-player.component.html',
  styleUrls: ['./tiktok-player.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TiktokPlayerComponent implements OnInit, OnDestroy {
  @Input() videoUrl?: string;
  @Input() embedUrl?: string;
  @Input() videoId?: string;
  @Input() width = '100%';
  @Input() height = '600';
  @Input() showControls = true;
  @Input() autoplay = false;
  @Input() loop = false;
  @Input() showThumbnail = false;

  @ViewChild('playerIframe', { static: false }) playerIframe?: ElementRef<HTMLIFrameElement>;

  safeEmbedUrl?: SafeResourceUrl;
  isValidUrl = false;
  isPlaying = false;
  isLoading = true;
  playerId = `tiktok-player-${Math.random().toString(36).substr(2, 9)}`;

  private messageListener?: (event: MessageEvent) => void;

  constructor(private sanitizer: DomSanitizer) {}

  ngOnInit(): void {
    this.setupMessageListener();
    
    if (this.embedUrl) {
      this.setupPlayerUrl(this.embedUrl);
    } else if (this.videoId) {
      // Generate player URL from video ID using official API
      const url = this.generatePlayerUrl(this.videoId);
      this.setupPlayerUrl(url);
    } else if (this.videoUrl) {
      // Extract video ID from URL and generate player URL
      const extractedId = this.extractVideoId(this.videoUrl);
      if (extractedId) {
        const url = this.generatePlayerUrl(extractedId);
        this.setupPlayerUrl(url);
      }
    }
  }

  ngOnDestroy(): void {
    if (this.messageListener) {
      window.removeEventListener('message', this.messageListener);
    }
  }

  private setupPlayerUrl(url: string): void {
    this.safeEmbedUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
    this.isValidUrl = true;
  }

  private generatePlayerUrl(videoId: string): string {
    const baseUrl = `https://www.tiktok.com/player/v1/${videoId}`;
    const params = new URLSearchParams();
    
    // Add customization parameters
    if (this.autoplay) params.set('autoplay', '1');
    if (this.loop) params.set('loop', '1');
    if (!this.showControls) params.set('controls', '0');
    
    const queryString = params.toString();
    return queryString ? `${baseUrl}?${queryString}` : baseUrl;
  }

  private setupMessageListener(): void {
    this.messageListener = (event: MessageEvent) => {
      // Verify origin for security
      if (!event.origin.includes('tiktok.com')) {
        return;
      }

      try {
        const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
        this.handlePlayerMessage(data);
      } catch (error) {
        // Ignore invalid JSON
      }
    };

    window.addEventListener('message', this.messageListener);
  }

  private handlePlayerMessage(data: any): void {
    if (data.type) {
      switch (data.type) {
        case 'video_playing':
          this.isPlaying = true;
          this.isLoading = false;
          break;
        case 'video_paused':
          this.isPlaying = false;
          break;
        case 'video_buffering':
          this.isLoading = true;
          break;
        case 'video_loaded':
          this.isLoading = false;
          break;
      }
    }
  }

  private extractVideoId(url: string): string | null {
    // Extract video ID from TikTok URL
    // Format: https://www.tiktok.com/@username/video/1234567890123456789
    const match = url.match(/\/video\/(\d+)/);
    if (match) {
      return match[1];
    }

    // For short URLs like vm.tiktok.com/ABC123/, we can't extract ID directly
    // Would need backend resolution
    return null;
  }

  onIframeError(): void {
    this.isValidUrl = false;
    this.isLoading = false;
  }

  onIframeLoad(): void {
    this.isLoading = false;
  }

  // Public methods for external control
  play(): void {
    this.sendPlayerCommand('play');
  }

  pause(): void {
    this.sendPlayerCommand('pause');
  }

  togglePlayPause(): void {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }

  private sendPlayerCommand(command: string, params?: any): void {
    if (this.playerIframe?.nativeElement?.contentWindow) {
      const message = { type: command, ...params };
      this.playerIframe.nativeElement.contentWindow.postMessage(
        JSON.stringify(message),
        'https://www.tiktok.com'
      );
    }
  }
}

import { Component, Input, OnInit, ChangeDetectionStrategy } from '@angular/core';
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
export class TiktokPlayerComponent implements OnInit {
  @Input() videoUrl?: string;
  @Input() embedUrl?: string;
  @Input() videoId?: string;
  @Input() width = '100%';
  @Input() height = '600';
  @Input() showControls = true;

  safeEmbedUrl?: SafeResourceUrl;
  isValidUrl = false;

  constructor(private sanitizer: DomSanitizer) {}

  ngOnInit(): void {
    if (this.embedUrl) {
      this.setupEmbedUrl(this.embedUrl);
    } else if (this.videoId) {
      // Generate embed URL from video ID
      const url = `https://www.tiktok.com/embed/v2/${this.videoId}`;
      this.setupEmbedUrl(url);
    } else if (this.videoUrl) {
      // Extract video ID from URL and generate embed URL
      const extractedId = this.extractVideoId(this.videoUrl);
      if (extractedId) {
        const url = `https://www.tiktok.com/embed/v2/${extractedId}`;
        this.setupEmbedUrl(url);
      }
    }
  }

  private setupEmbedUrl(url: string): void {
    this.safeEmbedUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
    this.isValidUrl = true;
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
  }
}

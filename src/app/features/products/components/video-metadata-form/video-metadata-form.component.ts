import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductVideoFormData } from '../../models/product-video.model';

@Component({
  selector: 'app-video-metadata-form',
  imports: [CommonModule, FormsModule],
  templateUrl: './video-metadata-form.component.html',
  styleUrl: './video-metadata-form.component.css'
})
export class VideoMetadataFormComponent {
  @Input() videos = signal<ProductVideoFormData[]>([]);
  @Output() videosChanged = new EventEmitter<ProductVideoFormData[]>();

  protected updateVideoDescription(index: number, event: Event): void {
    const description = (event.target as HTMLTextAreaElement).value;
    const currentVideos = this.videos();
    const updatedVideos = [...currentVideos];
    updatedVideos[index] = { ...updatedVideos[index], description };
    this.videos.set(updatedVideos);
    this.videosChanged.emit(updatedVideos);
  }

  protected updateVideoFeatured(index: number, event: Event): void {
    const is_featured = (event.target as HTMLInputElement).checked;
    const currentVideos = this.videos();
    const updatedVideos = [...currentVideos];
    
    // Only one video can be featured - uncheck others if this is checked
    if (is_featured) {
      updatedVideos.forEach((video, i) => {
        if (i !== index) {
          video.is_featured = false;
        }
      });
    }
    
    updatedVideos[index] = { ...updatedVideos[index], is_featured };
    this.videos.set(updatedVideos);
    this.videosChanged.emit(updatedVideos);
  }

  protected updateVideoActive(index: number, event: Event): void {
    const is_active = (event.target as HTMLInputElement).checked;
    const currentVideos = this.videos();
    const updatedVideos = [...currentVideos];
    updatedVideos[index] = { ...updatedVideos[index], is_active };
    this.videos.set(updatedVideos);
    this.videosChanged.emit(updatedVideos);
  }
}

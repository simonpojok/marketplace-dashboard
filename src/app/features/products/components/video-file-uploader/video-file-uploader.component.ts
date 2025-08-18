import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductVideoFormData, VIDEO_VALIDATION, VIDEO_ERROR_MESSAGES, VideoValidationResult } from '../../models/product-video.model';

@Component({
  selector: 'app-video-file-uploader',
  imports: [CommonModule],
  templateUrl: './video-file-uploader.component.html',
  styleUrl: './video-file-uploader.component.css'
})
export class VideoFileUploaderComponent {
  @Input() disabled = false;
  @Input() maxVideos = VIDEO_VALIDATION.MAX_VIDEOS_PER_PRODUCT;
  @Input() currentVideoCount = 0;
  @Output() filesSelected = new EventEmitter<ProductVideoFormData[]>();
  @Output() validationError = new EventEmitter<string>();

  protected isDragOver = signal(false);
  protected selectedFiles = signal<ProductVideoFormData[]>([]);
  protected isProcessing = signal(false);

  // Constants for template
  protected readonly VIDEO_VALIDATION = VIDEO_VALIDATION;

  protected onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.handleFiles(Array.from(input.files));
    }
  }

  protected onDragOver(event: DragEvent): void {
    event.preventDefault();
    if (!this.disabled) {
      this.isDragOver.set(true);
    }
  }

  protected onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver.set(false);
  }

  protected onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver.set(false);
    
    if (this.disabled) return;

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      const videoFiles = Array.from(files).filter(file => 
        VIDEO_VALIDATION.SUPPORTED_MIME_TYPES.includes(file.type as any)
      );
      
      if (videoFiles.length > 0) {
        this.handleFiles(videoFiles);
      } else {
        this.validationError.emit('Please select valid video files');
      }
    }
  }

  private async handleFiles(files: File[]): Promise<void> {
    // Check if we can add more videos
    if (this.currentVideoCount + files.length > this.maxVideos) {
      this.validationError.emit(`Cannot upload more than ${this.maxVideos} videos per product`);
      return;
    }

    this.isProcessing.set(true);
    const validVideos: ProductVideoFormData[] = [];

    for (const file of files) {
      try {
        // Validate file
        const validation = this.validateVideoFile(file);
        if (!validation.valid) {
          this.validationError.emit(`${file.name}: ${validation.error}`);
          continue;
        }

        // Get video metadata
        const duration = await this.getVideoDuration(file);
        const preview = await this.generateVideoPreview(file);

        const videoData: ProductVideoFormData = {
          file,
          description: '',
          duration,
          is_featured: validVideos.length === 0 && this.currentVideoCount === 0, // First video is featured
          is_active: true,
          display_order: this.currentVideoCount + validVideos.length,
          preview
        };

        validVideos.push(videoData);
      } catch (error) {
        console.error(`Error processing ${file.name}:`, error);
        this.validationError.emit(`Failed to process ${file.name}`);
      }
    }

    this.selectedFiles.set(validVideos);
    this.isProcessing.set(false);

    if (validVideos.length > 0) {
      this.filesSelected.emit(validVideos);
    }
  }

  private validateVideoFile(file: File): VideoValidationResult {
    // Check if file exists
    if (!file) {
      return {
        valid: false,
        error: VIDEO_ERROR_MESSAGES.INVALID_FILE
      };
    }

    // Check file type
    if (!VIDEO_VALIDATION.SUPPORTED_MIME_TYPES.includes(file.type as any)) {
      return {
        valid: false,
        error: VIDEO_ERROR_MESSAGES.UNSUPPORTED_FORMAT
      };
    }

    // Check file size - minimum
    if (file.size < VIDEO_VALIDATION.MIN_SIZE) {
      return {
        valid: false,
        error: VIDEO_ERROR_MESSAGES.FILE_TOO_SMALL
      };
    }

    // Check file size - maximum
    if (file.size > VIDEO_VALIDATION.MAX_SIZE) {
      return {
        valid: false,
        error: VIDEO_ERROR_MESSAGES.FILE_TOO_LARGE
      };
    }

    return { valid: true };
  }

  private getVideoDuration(file: File): Promise<number> {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      video.preload = 'metadata';
      
      video.onloadedmetadata = () => {
        window.URL.revokeObjectURL(video.src);
        
        // Validate duration
        if (video.duration > VIDEO_VALIDATION.MAX_DURATION) {
          reject(new Error(VIDEO_ERROR_MESSAGES.DURATION_TOO_LONG));
          return;
        }
        
        if (video.duration < VIDEO_VALIDATION.MIN_DURATION) {
          reject(new Error(VIDEO_ERROR_MESSAGES.DURATION_TOO_SHORT));
          return;
        }
        
        resolve(video.duration);
      };
      
      video.onerror = () => {
        window.URL.revokeObjectURL(video.src);
        reject(new Error('Failed to load video metadata'));
      };
      
      video.src = window.URL.createObjectURL(file);
    });
  }

  private generateVideoPreview(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      video.src = window.URL.createObjectURL(file);
      
      video.onloadedmetadata = () => {
        video.currentTime = 1; // Seek to 1 second for thumbnail
      };
      
      video.onseeked = () => {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        if (context) {
          context.drawImage(video, 0, 0);
          const thumbnail = canvas.toDataURL('image/jpeg', 0.8);
          window.URL.revokeObjectURL(video.src);
          resolve(thumbnail);
        } else {
          reject(new Error('Failed to create canvas context'));
        }
      };
      
      video.onerror = () => {
        window.URL.revokeObjectURL(video.src);
        reject(new Error('Failed to load video'));
      };
    });
  }

  protected removeFile(index: number): void {
    const current = this.selectedFiles();
    const updated = current.filter((_, i) => i !== index);
    this.selectedFiles.set(updated);
    this.filesSelected.emit(updated);
  }

  protected formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  protected formatDuration(seconds: number): string {
    if (seconds < 60) {
      return `${Math.round(seconds)}s`;
    } else {
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = Math.round(seconds % 60);
      return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`;
    }
  }

  protected canAddMoreVideos(): boolean {
    return this.currentVideoCount < this.maxVideos && !this.disabled;
  }

  protected getRemainingVideoSlots(): number {
    return this.maxVideos - this.currentVideoCount;
  }
}

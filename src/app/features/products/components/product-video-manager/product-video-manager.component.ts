import { Component, Input, Output, EventEmitter, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
// Drag and drop temporarily disabled
import { ProductVideoService } from '../../services/product-video.service';
import { ProductVideo, ProductVideoFormData } from '../../models/product-video.model';
import { ToastService } from '../../../../core/services/toast.service';
import { ProductVideoUploadComponent } from '../product-video-upload/product-video-upload.component';
import { ProductVideoPreviewComponent } from '../product-video-preview/product-video-preview.component';

@Component({
  selector: 'app-product-video-manager',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    // DragDropModule,
    ProductVideoUploadComponent,
    ProductVideoPreviewComponent
  ],
  templateUrl: './product-video-manager.component.html',
  styleUrls: ['./product-video-manager.component.scss']
})
export class ProductVideoManagerComponent implements OnInit, OnDestroy {
  @Input() productId!: string;
  @Input() initialVideos: ProductVideo[] = [];
  @Output() videosChanged = new EventEmitter<ProductVideo[]>();

  private fb = inject(FormBuilder);
  private videoService = inject(ProductVideoService);
  private toastService = inject(ToastService);

  // Component state
  protected videos = signal<ProductVideo[]>([]);
  protected isLoading = signal(false);
  protected showUploader = signal(false);
  protected editingVideo = signal<ProductVideo | null>(null);
  protected isDragging = signal(false);

  // Edit form
  protected editForm: FormGroup;

  constructor() {
    this.editForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      description: ['', [Validators.maxLength(500)]],
      is_featured: [false],
      is_active: [true]
    });
  }

  ngOnInit(): void {
    this.videos.set([...this.initialVideos]);
    this.loadVideos();
  }

  ngOnDestroy(): void {
    // Clean up any object URLs that might be hanging around
    this.videos().forEach(video => {
      if (video.video_file && video.video_file.startsWith('blob:')) {
        URL.revokeObjectURL(video.video_file);
      }
    });
  }

  private async loadVideos(): Promise<void> {
    if (!this.productId) return;

    this.isLoading.set(true);
    try {
      this.videoService.getProductVideos(this.productId).subscribe({
        next: (videos) => {
          this.videos.set(videos);
          this.videosChanged.emit(videos);
        },
        error: (error) => {
          console.error('Failed to load videos:', error);
          this.toastService.error('Failed to load product videos');
        },
        complete: () => {
          this.isLoading.set(false);
        }
      });
    } catch (error) {
      console.error('Failed to load videos:', error);
      this.isLoading.set(false);
      this.toastService.error('Failed to load product videos');
    }
  }

  protected onShowUploader(): void {
    this.showUploader.set(true);
  }

  protected onHideUploader(): void {
    this.showUploader.set(false);
  }

  protected onVideoUploaded(video: ProductVideo): void {
    const currentVideos = this.videos();
    const updatedVideos = [...currentVideos, video];
    this.videos.set(updatedVideos);
    this.videosChanged.emit(updatedVideos);
    this.showUploader.set(false);
    this.toastService.success('Video uploaded successfully');
  }

  protected onUploadCancelled(): void {
    this.showUploader.set(false);
  }

  protected onEditVideo(video: ProductVideo): void {
    this.editingVideo.set(video);
    this.editForm.patchValue({
      title: video.title,
      description: video.description || '',
      is_featured: video.is_featured,
      is_active: video.is_active
    });
  }

  protected onCancelEdit(): void {
    this.editingVideo.set(null);
    this.editForm.reset();
  }

  protected onSaveEdit(): void {
    const video = this.editingVideo();
    if (!video || this.editForm.invalid) return;

    const formValue = this.editForm.value;
    const updateData: Partial<ProductVideoFormData> = {
      title: formValue.title,
      description: formValue.description || '',
      is_featured: formValue.is_featured,
      is_active: formValue.is_active
    };

    this.videoService.updateVideo(this.productId, video.id, updateData).subscribe({
      next: (updatedVideo) => {
        const currentVideos = this.videos();
        const index = currentVideos.findIndex(v => v.id === video.id);
        if (index !== -1) {
          const newVideos = [...currentVideos];
          newVideos[index] = updatedVideo;
          this.videos.set(newVideos);
          this.videosChanged.emit(newVideos);
        }
        this.editingVideo.set(null);
        this.editForm.reset();
        this.toastService.success('Video updated successfully');
      },
      error: (error) => {
        console.error('Failed to update video:', error);
        this.toastService.error('Failed to update video');
      }
    });
  }

  protected onDeleteVideo(video: ProductVideo): void {
    if (!confirm(`Are you sure you want to delete "${video.title}"? This action cannot be undone.`)) {
      return;
    }

    this.videoService.deleteVideo(this.productId, video.id).subscribe({
      next: () => {
        const currentVideos = this.videos();
        const updatedVideos = currentVideos.filter(v => v.id !== video.id);
        this.videos.set(updatedVideos);
        this.videosChanged.emit(updatedVideos);
        this.toastService.success('Video deleted successfully');
      },
      error: (error) => {
        console.error('Failed to delete video:', error);
        this.toastService.error('Failed to delete video');
      }
    });
  }

  protected onSetFeatured(video: ProductVideo): void {
    this.videoService.setFeaturedVideo(this.productId, video.id).subscribe({
      next: () => {
        // Update local state to reflect the change
        const currentVideos = this.videos();
        const updatedVideos = currentVideos.map(v => ({
          ...v,
          is_featured: v.id === video.id
        }));
        this.videos.set(updatedVideos);
        this.videosChanged.emit(updatedVideos);
        this.toastService.success('Featured video updated');
      },
      error: (error) => {
        console.error('Failed to set featured video:', error);
        this.toastService.error('Failed to update featured video');
      }
    });
  }

  protected onDrop(event: any): void {
    // Temporarily disabled - drag and drop functionality
    console.log('Drag and drop temporarily disabled');
  }

  protected onDragStarted(): void {
    this.isDragging.set(true);
  }

  protected onDragEnded(): void {
    this.isDragging.set(false);
  }

  protected getVideoCount(): number {
    return this.videos().length;
  }

  protected getFeaturedVideo(): ProductVideo | null {
    return this.videos().find(v => v.is_featured) || null;
  }

  protected hasVideos(): boolean {
    return this.videos().length > 0;
  }

  protected formatDuration(seconds: number): string {
    return this.videoService.formatDuration(seconds);
  }

  protected formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Validation helpers
  protected isEditFormValid(): boolean {
    return this.editForm.valid;
  }

  protected getEditFieldError(fieldName: string): string | null {
    const field = this.editForm.get(fieldName);
    if (field?.errors && field?.touched) {
      if (field.errors['required']) return `${fieldName} is required`;
      if (field.errors['minlength']) return `${fieldName} is too short`;
      if (field.errors['maxlength']) return `${fieldName} is too long`;
    }
    return null;
  }

  // Track by function for ngFor optimization
  protected trackByVideoId(index: number, video: ProductVideo): string {
    return video.id;
  }
}
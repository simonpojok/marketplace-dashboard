import { Component, Input, Output, EventEmitter, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProductVideoService, VideoUploadProgress } from '../../services/product-video.service';
import { ProductVideo, ProductVideoFormData, VIDEO_VALIDATION } from '../../models/product-video.model';
import { ToastService } from '../../../../core/services/toast.service';

@Component({
  selector: 'app-product-video-upload',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './product-video-upload.component.html',
  styleUrls: ['./product-video-upload.component.scss']
})
export class ProductVideoUploadComponent {
  @Input() productId!: string;
  @Input() existingVideos: ProductVideo[] = [];
  @Output() videoUploaded = new EventEmitter<ProductVideo>();
  @Output() uploadCancelled = new EventEmitter<void>();

  private fb = inject(FormBuilder);
  private videoService = inject(ProductVideoService);
  private toastService = inject(ToastService);

  // Component state
  protected isUploading = signal(false);
  protected uploadProgress = signal(0);
  protected isDragOver = signal(false);
  protected selectedFile = signal<File | null>(null);
  protected videoPreview = signal<string | null>(null);
  protected videoDuration = signal<number | null>(null);
  protected validationError = signal<string | null>(null);

  // Form
  protected videoForm: FormGroup;

  // Constants for template
  protected readonly VIDEO_VALIDATION = VIDEO_VALIDATION;

  constructor() {
    this.videoForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      description: ['', [Validators.maxLength(500)]],
      is_featured: [false],
      is_active: [true]
    });
  }

  protected onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.handleFileSelection(input.files[0]);
    }
  }

  protected onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver.set(true);
  }

  protected onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver.set(false);
  }

  protected onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver.set(false);

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.handleFileSelection(files[0]);
    }
  }

  private handleFileSelection(file: File): void {
    this.validationError.set(null);

    // Validate file
    const validation = this.videoService.validateVideoFile(file);
    if (!validation.valid) {
      this.validationError.set(validation.error!);
      this.resetFileSelection();
      return;
    }

    this.selectedFile.set(file);

    // Generate preview and get video metadata
    this.generateVideoPreview(file);
    this.getVideoMetadata(file);

    // Auto-populate title if empty
    if (!this.videoForm.get('title')?.value) {
      const fileName = file.name.replace(/\.[^/.]+$/, ''); // Remove extension
      this.videoForm.patchValue({ title: fileName });
    }
  }

  private async generateVideoPreview(file: File): Promise<void> {
    try {
      const previewUrl = URL.createObjectURL(file);
      this.videoPreview.set(previewUrl);
    } catch (error) {
      console.error('Failed to generate video preview:', error);
    }
  }

  private async getVideoMetadata(file: File): Promise<void> {
    try {
      const duration = await this.videoService.getVideoDuration(file);
      this.videoDuration.set(duration);

      // Validate duration
      if (duration > VIDEO_VALIDATION.MAX_DURATION) {
        this.validationError.set(`Video duration too long. Maximum duration is ${VIDEO_VALIDATION.MAX_DURATION / 60} minutes.`);
        this.resetFileSelection();
      }
    } catch (error) {
      console.error('Failed to get video metadata:', error);
      this.validationError.set('Failed to load video metadata. Please try another file.');
      this.resetFileSelection();
    }
  }

  protected resetFileSelection(): void {
    this.selectedFile.set(null);
    if (this.videoPreview()) {
      URL.revokeObjectURL(this.videoPreview()!);
      this.videoPreview.set(null);
    }
    this.videoDuration.set(null);
    this.validationError.set(null);
  }

  protected onUpload(): void {
    if (this.videoForm.invalid || !this.selectedFile() || this.isUploading()) {
      return;
    }

    const file = this.selectedFile()!;
    const formValue = this.videoForm.value;

    const videoData: ProductVideoFormData = {
      video_file: file,
      title: formValue.title,
      description: formValue.description || '',
      is_featured: formValue.is_featured,
      is_active: formValue.is_active,
      display_order: this.existingVideos.length + 1,
      preview: this.videoPreview() || undefined
    };

    this.isUploading.set(true);
    this.uploadProgress.set(0);

    this.videoService.uploadVideo(this.productId, videoData).subscribe({
      next: (progress: VideoUploadProgress) => {
        this.uploadProgress.set(progress.progress);
        
        if (progress.completed && progress.video) {
          this.onUploadSuccess(progress.video);
        }
      },
      error: (error) => {
        console.error('Video upload failed:', error);
        this.onUploadError(error);
      }
    });
  }

  private onUploadSuccess(video: ProductVideo): void {
    this.isUploading.set(false);
    this.uploadProgress.set(0);
    this.toastService.success('Video uploaded successfully');
    this.videoUploaded.emit(video);
    this.resetForm();
  }

  private onUploadError(error: any): void {
    this.isUploading.set(false);
    this.uploadProgress.set(0);
    
    let errorMessage = 'Failed to upload video';
    if (error.error?.message) {
      errorMessage = error.error.message;
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    this.toastService.error(errorMessage);
    this.validationError.set(errorMessage);
  }

  protected onCancel(): void {
    if (this.isUploading()) {
      // Note: In a real application, you might want to implement upload cancellation
      this.toastService.warning('Upload cannot be cancelled once started');
      return;
    }

    this.resetForm();
    this.uploadCancelled.emit();
  }

  private resetForm(): void {
    this.videoForm.reset({
      title: '',
      description: '',
      is_featured: false,
      is_active: true
    });
    this.resetFileSelection();
  }

  protected formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  protected formatDuration(seconds: number | null): string {
    if (!seconds) return '--';
    return this.videoService.formatDuration(seconds);
  }

  protected hasValidationError(): boolean {
    return !!this.validationError();
  }

  protected canUpload(): boolean {
    return this.videoForm.valid && 
           !!this.selectedFile() && 
           !this.isUploading() && 
           !this.hasValidationError();
  }

  protected getProgressBarClass(): string {
    const progress = this.uploadProgress();
    if (progress === 100) return 'bg-green-500';
    if (progress > 0) return 'bg-blue-500';
    return 'bg-gray-300';
  }
}
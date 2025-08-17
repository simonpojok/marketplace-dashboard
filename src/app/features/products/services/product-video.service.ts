import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpEvent, HttpEventType, HttpRequest } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ProductVideo, ProductVideoFormData, VideoValidationResult, VIDEO_VALIDATION, VIDEO_ERROR_MESSAGES } from '../models/product-video.model';

export interface VideoUploadProgress {
  progress: number;
  video?: ProductVideo;
  error?: string;
  completed: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ProductVideoService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}${environment.apiVersion}/admin`;

  /**
   * Get all videos for a specific product
   */
  getProductVideos(productId: string): Observable<ProductVideo[]> {
    return this.http.get<{ videos: ProductVideo[] }>(`${this.apiUrl}/products/${productId}/videos/`)
      .pipe(map(response => response.videos || []));
  }

  /**
   * Upload a video for a product with progress tracking
   */
  uploadVideo(productId: string, videoData: ProductVideoFormData): Observable<VideoUploadProgress> {
    const formData = new FormData();
    
    // Add video file if provided
    if (videoData.video_file) {
      formData.append('video_file', videoData.video_file);
    }
    
    // Add product ID
    formData.append('product', productId);
    
    // Add video metadata
    formData.append('title', videoData.title);
    if (videoData.description) {
      formData.append('description', videoData.description);
    }
    formData.append('is_featured', videoData.is_featured.toString());
    formData.append('is_active', videoData.is_active.toString());
    formData.append('display_order', videoData.display_order.toString());

    // Create HTTP request with progress tracking
    const request = new HttpRequest('POST', `${this.apiUrl}/products/${productId}/videos/`, formData, {
      reportProgress: true
    });

    return this.http.request<ProductVideo>(request).pipe(
      map((event: HttpEvent<ProductVideo>) => {
        switch (event.type) {
          case HttpEventType.UploadProgress:
            const progress = event.total ? Math.round(100 * event.loaded / event.total) : 0;
            return {
              progress,
              completed: false
            };

          case HttpEventType.Response:
            return {
              progress: 100,
              video: event.body!,
              completed: true
            };

          default:
            return {
              progress: 0,
              completed: false
            };
        }
      })
    );
  }

  /**
   * Update video metadata
   */
  updateVideo(productId: string, videoId: string, data: Partial<ProductVideoFormData>): Observable<ProductVideo> {
    const updateData: any = {};
    
    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.is_featured !== undefined) updateData.is_featured = data.is_featured;
    if (data.is_active !== undefined) updateData.is_active = data.is_active;
    if (data.display_order !== undefined) updateData.display_order = data.display_order;

    return this.http.patch<ProductVideo>(`${this.apiUrl}/products/${productId}/videos/${videoId}/`, updateData);
  }

  /**
   * Delete a video
   */
  deleteVideo(productId: string, videoId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/products/${productId}/videos/${videoId}/`);
  }

  /**
   * Reorder videos for a product
   */
  reorderVideos(productId: string, videoIds: string[]): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/products/${productId}/videos/reorder/`, {
      video_ids: videoIds
    });
  }

  /**
   * Set a video as featured (and unfeature others)
   */
  setFeaturedVideo(productId: string, videoId: string): Observable<ProductVideo> {
    return this.updateVideo(productId, videoId, { is_featured: true });
  }

  /**
   * Bulk upload videos
   */
  bulkUploadVideos(productId: string, videos: ProductVideoFormData[]): Observable<VideoUploadProgress[]> {
    const formData = new FormData();
    
    // Add all video files
    videos.forEach((video, index) => {
      if (video.video_file) {
        formData.append('video_files', video.video_file);
        formData.append(`titles[${index}]`, video.title);
        if (video.description) {
          formData.append(`descriptions[${index}]`, video.description);
        }
        formData.append(`is_featured[${index}]`, video.is_featured.toString());
        formData.append(`is_active[${index}]`, video.is_active.toString());
        formData.append(`display_orders[${index}]`, video.display_order.toString());
      }
    });

    formData.append('product', productId);

    const request = new HttpRequest('POST', `${this.apiUrl}/products/${productId}/videos/bulk-upload/`, formData, {
      reportProgress: true
    });

    return this.http.request<ProductVideo[]>(request).pipe(
      map((event: HttpEvent<ProductVideo[]>) => {
        switch (event.type) {
          case HttpEventType.UploadProgress:
            const progress = event.total ? Math.round(100 * event.loaded / event.total) : 0;
            return videos.map(() => ({
              progress,
              completed: false
            }));

          case HttpEventType.Response:
            return (event.body || []).map(video => ({
              progress: 100,
              video,
              completed: true
            }));

          default:
            return videos.map(() => ({
              progress: 0,
              completed: false
            }));
        }
      })
    );
  }

  /**
   * Validate video file before upload
   */
  validateVideoFile(file: File): VideoValidationResult {
    const warnings: string[] = [];

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

    // Add warning for large files
    if (file.size > VIDEO_VALIDATION.MAX_SIZE * 0.8) {
      warnings.push('Large file size may take longer to upload and process');
    }

    return { 
      valid: true, 
      warnings: warnings.length > 0 ? warnings : undefined 
    };
  }

  /**
   * Validate video duration after loading metadata
   */
  validateVideoDuration(duration: number): VideoValidationResult {
    if (duration < VIDEO_VALIDATION.MIN_DURATION) {
      return {
        valid: false,
        error: VIDEO_ERROR_MESSAGES.DURATION_TOO_SHORT
      };
    }

    if (duration > VIDEO_VALIDATION.MAX_DURATION) {
      return {
        valid: false,
        error: VIDEO_ERROR_MESSAGES.DURATION_TOO_LONG
      };
    }

    const warnings: string[] = [];
    
    // Add warning for long videos
    if (duration > VIDEO_VALIDATION.MAX_DURATION * 0.8) {
      warnings.push('Long videos may have slower playback on some devices');
    }

    return { 
      valid: true, 
      warnings: warnings.length > 0 ? warnings : undefined 
    };
  }

  /**
   * Validate video form data
   */
  validateVideoFormData(data: Partial<ProductVideoFormData>): VideoValidationResult {
    // Check title
    if (!data.title || data.title.trim().length === 0) {
      return {
        valid: false,
        error: VIDEO_ERROR_MESSAGES.TITLE_REQUIRED
      };
    }

    if (data.title.trim().length < VIDEO_VALIDATION.TITLE.MIN_LENGTH) {
      return {
        valid: false,
        error: VIDEO_ERROR_MESSAGES.TITLE_TOO_SHORT
      };
    }

    if (data.title.trim().length > VIDEO_VALIDATION.TITLE.MAX_LENGTH) {
      return {
        valid: false,
        error: VIDEO_ERROR_MESSAGES.TITLE_TOO_LONG
      };
    }

    // Check description
    if (data.description && data.description.length > VIDEO_VALIDATION.DESCRIPTION.MAX_LENGTH) {
      return {
        valid: false,
        error: VIDEO_ERROR_MESSAGES.DESCRIPTION_TOO_LONG
      };
    }

    return { valid: true };
  }

  /**
   * Check if product can accept more videos
   */
  canAddMoreVideos(currentVideoCount: number): VideoValidationResult {
    if (currentVideoCount >= VIDEO_VALIDATION.MAX_VIDEOS_PER_PRODUCT) {
      return {
        valid: false,
        error: VIDEO_ERROR_MESSAGES.MAX_VIDEOS_REACHED
      };
    }

    const warnings: string[] = [];
    
    // Add warning when approaching limit
    if (currentVideoCount >= VIDEO_VALIDATION.MAX_VIDEOS_PER_PRODUCT * 0.8) {
      warnings.push(`Approaching video limit (${currentVideoCount}/${VIDEO_VALIDATION.MAX_VIDEOS_PER_PRODUCT})`);
    }

    return { 
      valid: true, 
      warnings: warnings.length > 0 ? warnings : undefined 
    };
  }

  /**
   * Get video duration from file
   */
  getVideoDuration(file: File): Promise<number> {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      video.preload = 'metadata';
      
      video.onloadedmetadata = () => {
        window.URL.revokeObjectURL(video.src);
        resolve(video.duration);
      };
      
      video.onerror = () => {
        window.URL.revokeObjectURL(video.src);
        reject(new Error('Failed to load video metadata'));
      };
      
      video.src = window.URL.createObjectURL(file);
    });
  }

  /**
   * Generate video thumbnail from file
   */
  generateVideoThumbnail(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      
      video.onloadedmetadata = () => {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        video.currentTime = 1; // Seek to 1 second for thumbnail
      };
      
      video.onseeked = () => {
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
      
      video.src = window.URL.createObjectURL(file);
    });
  }

  /**
   * Format duration in seconds to human-readable format
   */
  formatDuration(seconds: number): string {
    if (seconds < 60) {
      return `${Math.round(seconds)}s`;
    } else if (seconds < 3600) {
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = Math.round(seconds % 60);
      return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`;
    } else {
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
    }
  }
}
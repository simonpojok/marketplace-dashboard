// Updated video models for integrated product video upload

export interface ProductVideo {
  id?: string;
  video_url?: string;
  thumbnail_url?: string;
  description?: string;
  duration?: number;
  formatted_duration?: string;
  is_featured: boolean;
  is_active: boolean;
  display_order: number;
  product_name?: string;
  file_size_display?: string;
  created_at?: string;
  updated_at?: string;
}

// Form data interface for video upload during product creation/update
export interface ProductVideoFormData {
  file?: File;
  description?: string;
  duration?: number;
  is_featured: boolean;
  is_active: boolean;
  display_order: number;
  preview?: string;
}

// Video request interface matching API specification
export interface VideoMetadata {
  id?: string; // For updates
  description?: string;
  duration?: number;
  is_featured?: boolean;
  is_active?: boolean;
  display_order?: number;
}

// Video validation interfaces
export interface VideoValidationResult {
  valid: boolean;
  error?: string;
  warnings?: string[];
}

export interface VideoFileInfo {
  name: string;
  size: number;
  type: string;
  duration?: number;
  dimensions?: {
    width: number;
    height: number;
  };
}

// Video validation constants
export const VIDEO_VALIDATION = {
  MAX_SIZE: 50 * 1024 * 1024, // 50MB as per API spec
  MIN_SIZE: 100 * 1024, // 100KB minimum
  MAX_DURATION: 300, // 5 minutes in seconds as per API spec
  MIN_DURATION: 1, // 1 second minimum
  SUPPORTED_FORMATS: ['.mp4', '.mov', '.webm', '.avi'],
  SUPPORTED_MIME_TYPES: ['video/mp4', 'video/quicktime', 'video/webm', 'video/avi'],
  DESCRIPTION: {
    MAX_LENGTH: 500
  },
  MAX_VIDEOS_PER_PRODUCT: 10
} as const;

// Error messages
export const VIDEO_ERROR_MESSAGES = {
  FILE_TOO_LARGE: `File size exceeds the maximum limit of ${VIDEO_VALIDATION.MAX_SIZE / (1024 * 1024)}MB`,
  FILE_TOO_SMALL: `File size is below the minimum limit of ${VIDEO_VALIDATION.MIN_SIZE / 1024}KB`,
  DURATION_TOO_LONG: `Video duration exceeds the maximum limit of ${VIDEO_VALIDATION.MAX_DURATION / 60} minutes`,
  DURATION_TOO_SHORT: `Video duration is below the minimum limit of ${VIDEO_VALIDATION.MIN_DURATION} second`,
  UNSUPPORTED_FORMAT: `Unsupported video format. Please use: ${VIDEO_VALIDATION.SUPPORTED_FORMATS.join(', ')}`,
  INVALID_FILE: 'Please select a valid video file',
  DESCRIPTION_TOO_LONG: `Description cannot exceed ${VIDEO_VALIDATION.DESCRIPTION.MAX_LENGTH} characters`,
  MAX_VIDEOS_REACHED: `Cannot upload more than ${VIDEO_VALIDATION.MAX_VIDEOS_PER_PRODUCT} videos per product`,
  UPLOAD_FAILED: 'Failed to upload video. Please try again.',
  PROCESSING_FAILED: 'Failed to process video file. Please check the file and try again.'
} as const;
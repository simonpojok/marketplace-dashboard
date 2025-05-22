import {Component, Input, Output, EventEmitter, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';

@Component({
  selector: 'app-product-images',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: 'product-images.component.html',
  styles: []
})
export class ProductImagesComponent {
  @Input() imagesFormArray!: FormArray;
  @Input() isEdit = false;
  @Output() filesChanged = new EventEmitter<File[]>();
  @Output() imageRemoved = new EventEmitter<string>();

  private fb = new FormBuilder();
  protected dragOverSignal = signal(false);
  protected imagePreviews = signal<{[key: number]: string}>({});
  private uploadedFiles: File[] = [];

  get imagesGroups(): FormGroup[] {
    return this.imagesFormArray.controls as FormGroup[];
  }

  protected addImage(): void {
    const imageGroup = this.fb.group({
      id: [null],
      image: [''],
      alt_text: [''],
      is_primary: [false],
      display_order: [this.imagesFormArray.length],
      file: [null]
    });

    this.imagesFormArray.push(imageGroup);
  }

  protected removeImage(index: number): void {
    const imageGroup = this.imagesFormArray.at(index) as FormGroup;
    const imageId = imageGroup.get('id')?.value;

    if (imageId) {
      this.imageRemoved.emit(imageId);
    }

    // Remove from previews
    this.imagePreviews.update(previews => {
      const updated = {...previews};
      delete updated[index];
      // Reindex remaining previews
      const reindexed: {[key: number]: string} = {};
      Object.keys(updated).forEach(key => {
        const numKey = parseInt(key);
        if (numKey > index) {
          reindexed[numKey - 1] = updated[numKey];
        } else {
          reindexed[numKey] = updated[numKey];
        }
      });
      return reindexed;
    });

    this.imagesFormArray.removeAt(index);
    this.updateFiles();
  }

  protected removeImagePreview(index: number): void {
    this.imagePreviews.update(previews => {
      const updated = {...previews};
      delete updated[index];
      return updated;
    });

    const imageGroup = this.imagesFormArray.at(index) as FormGroup;
    imageGroup.get('file')?.setValue(null);
    imageGroup.get('image')?.setValue('');
    this.updateFiles();
  }

  protected setPrimaryImage(index: number): void {
    // Uncheck all other primary flags
    for (let i = 0; i < this.imagesFormArray.length; i++) {
      if (i !== index) {
        this.imagesFormArray.at(i).get('is_primary')?.setValue(false);
      }
    }
  }

  protected onFileSelected(event: Event, index: number): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.processFile(input.files[0], index);
    }
  }

  protected onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.dragOverSignal.set(true);
  }

  protected onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.dragOverSignal.set(false);
  }

  protected onDrop(event: DragEvent, index: number): void {
    event.preventDefault();
    event.stopPropagation();
    this.dragOverSignal.set(false);

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        this.processFile(file, index);
      }
    }
  }

  private processFile(file: File, index: number): void {
    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10MB');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      this.imagePreviews.update(previews => ({
        ...previews,
        [index]: e.target?.result as string
      }));
    };
    reader.readAsDataURL(file);

    // Update form
    const imageGroup = this.imagesFormArray.at(index) as FormGroup;
    imageGroup.get('file')?.setValue(file);
    imageGroup.get('alt_text')?.setValue(imageGroup.get('alt_text')?.value || file.name);

    this.updateFiles();
  }

  private updateFiles(): void {
    this.uploadedFiles = [];
    for (let i = 0; i < this.imagesFormArray.length; i++) {
      const file = this.imagesFormArray.at(i).get('file')?.value;
      if (file) {
        this.uploadedFiles.push(file);
      }
    }
    this.filesChanged.emit(this.uploadedFiles);
  }

  protected getImagePreview(index: number): string | null {
    // Check for file preview first
    const filePreview = this.imagePreviews()[index];
    if (filePreview) {
      return filePreview;
    }

    // Check for existing URL
    const imageGroup = this.imagesFormArray.at(index) as FormGroup;
    const imageUrl = imageGroup.get('image')?.value;
    if (imageUrl && imageUrl.startsWith('http')) {
      return imageUrl;
    }

    return null;
  }

  protected isDragOver(): boolean {
    return this.dragOverSignal();
  }
}

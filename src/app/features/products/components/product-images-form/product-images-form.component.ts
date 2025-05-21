import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-product-images-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './product-images-form.component.html',
  styles: []
})
export class ProductImagesFormComponent {
  @Input() parentForm!: FormGroup;
  @Input() uploadedImages: { file: File, preview: string }[] = [];

  @Output() filesSelected = new EventEmitter<FileList>();
  @Output() imageRemoved = new EventEmitter<number>();
  @Output() primaryImageSet = new EventEmitter<number>();
  @Output() imageAdded = new EventEmitter<void>();
  @Output() fileDrop = new EventEmitter<DragEvent>();
  @Output() dragOver = new EventEmitter<DragEvent>();

  get imagesFormArray(): FormArray {
    return this.parentForm.get('images') as FormArray;
  }

  onFilesSelected(files: FileList | null): void {
    if (files) {
      this.filesSelected.emit(files);
    }
  }

  onImageRemoved(index: number): void {
    this.imageRemoved.emit(index);
  }

  onPrimaryImageSet(index: number): void {
    this.primaryImageSet.emit(index);
  }

  onImageAdded(): void {
    this.imageAdded.emit();
  }

  onFileDrop(event: DragEvent): void {
    this.fileDrop.emit(event);
  }

  onDragOver(event: DragEvent): void {
    this.dragOver.emit(event);
  }

  triggerFileInput(inputId: string): void {
    const element = document.getElementById(inputId) as HTMLInputElement;
    if (element) {
      element.click();
    }
  }

  onFileInputChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.onFilesSelected(input.files);
    }
  }
}

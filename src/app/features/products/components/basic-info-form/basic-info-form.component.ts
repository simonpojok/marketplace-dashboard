import {Component, Input, Output, EventEmitter, input, output} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormGroup, ReactiveFormsModule} from '@angular/forms';
import {Category, Brand} from '../../models/product.model';

@Component({
  selector: 'app-basic-info-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './basic-info-form.component.html',
  styles: []
})
export class BasicInfoFormComponent {
  parentForm = input.required<FormGroup>();
  categories = input.required<Category[]>()
  brands = input.required<Brand[]>()
  slugGenerated = output()

  // Method to generate slug from product name
  generateSlug(): void {
    this.slugGenerated.emit();
  }
}

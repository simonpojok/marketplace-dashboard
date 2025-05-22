import {Component, Input, Output, EventEmitter} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormGroup, ReactiveFormsModule} from '@angular/forms';
import {Brand, Category} from '../../models/product.model';

@Component({
  selector: 'app-product-basic-info',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: 'product-basic-info.component.html',
  styles: []
})
export class ProductBasicInfoComponent {
  @Input() formGroup!: FormGroup;
  @Input() categories: Category[] = [];
  @Input() brands: Brand[] = [];
  @Input() isEdit = false;
  @Output() slugGenerated = new EventEmitter<void>();

  protected onNameBlur(): void {
    this.slugGenerated.emit();
  }
}

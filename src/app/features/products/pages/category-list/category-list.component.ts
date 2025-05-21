import {Component, OnInit, inject, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule} from '@angular/router';
import {FormsModule} from '@angular/forms';
import {ProductsService} from '../../services/products.service';
import {Category} from '../../models/product.model';
import {ToastService} from '../../../../core/services/toast.service';

@Component({
  selector: 'app-category-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: 'category-list.component.html',
  styles: []
})
export class CategoryListComponent implements OnInit {
  private productsService = inject(ProductsService);
  private toastService = inject(ToastService);

  // Reactive state with signals
  protected isLoading = signal(true);
  protected categories = signal<Category[]>([]);
  protected searchTerm = signal('');
  protected expandedCategories = signal<Set<string>>(new Set());
  protected categoryMap = signal<Map<string, Category[]>>(new Map());

  ngOnInit(): void {
    this.loadCategories();
  }

  private loadCategories(): void {
    this.isLoading.set(true);
    this.productsService.getCategories().subscribe({
      next: (categories) => {
        this.categories.set(categories);
        this.buildCategoryTree(categories);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading categories:', error);
        this.toastService.error('Failed to load categories');
        this.isLoading.set(false);
      }
    });
  }

  protected onSearch(): void {
    const term = this.searchTerm().toLowerCase();

    if (!term) {
      this.buildCategoryTree(this.categories());
      return;
    }

    // If search term exists, filter categories
    const filtered = this.categories().filter(category =>
      category.name.toLowerCase().includes(term) ||
      (category.description && category.description.toLowerCase().includes(term))
    );

    this.buildCategoryTree(filtered);

    // Expand all parent categories when searching
    this.expandedCategories.update(set => {
      const newSet = new Set(set);
      filtered.forEach(category => {
        if (category.parent) {
          newSet.add(category.parent);
        }
      });
      return newSet;
    });
  }

  protected buildCategoryTree(categories: Category[]): void {
    // Group categories by parent
    const map = new Map<string, Category[]>();

    // First, gather root categories (parent is null)
    const rootCategories = categories.filter(cat => !cat.parent);
    map.set('root', rootCategories);

    // Then, group child categories by parent
    categories.forEach(category => {
      if (category.parent) {
        const parentId = category.parent;
        const children = map.get(parentId) || [];
        children.push(category);
        map.set(parentId, children);
      }
    });

    this.categoryMap.set(map);
  }

  protected toggleCategory(categoryId: string): void {
    this.expandedCategories.update(set => {
      const newSet = new Set(set);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  }

  protected isExpanded(categoryId: string): boolean {
    return this.expandedCategories().has(categoryId);
  }

  protected getChildCategories(parentId: string): Category[] {
    return this.categoryMap().get(parentId) || [];
  }

  protected hasChildren(categoryId: string): boolean {
    return !!this.categoryMap().get(categoryId)?.length;
  }

  protected deleteCategory(id: string, event: Event): void {
    event.preventDefault();
    event.stopPropagation();

    // Check if category has children
    if (this.hasChildren(id)) {
      this.toastService.error('Cannot delete a category with subcategories. Please delete subcategories first.');
      return;
    }

    if (confirm('Are you sure you want to delete this category? This action cannot be undone.')) {
      this.productsService.deleteCategory(id).subscribe({
        next: () => {
          this.toastService.success('Category deleted successfully');
          this.loadCategories();
        },
        error: (error) => {
          console.error('Error deleting category:', error);
          this.toastService.error('Failed to delete category');
        }
      });
    }
  }

  protected formatDate(dateString?: string): string {
    if (!dateString) return 'N/A';

    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
}

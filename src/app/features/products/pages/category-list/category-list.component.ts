import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductsService } from '../../services/products.service';
import { Category } from '../../models/product.model';
import { ToastService } from '../../../../core/services/toast.service';

@Component({
  selector: 'app-category-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './category-list.component.html',
  styles: []
})
export class CategoryListComponent implements OnInit {
  private productsService = inject(ProductsService);
  private toastService = inject(ToastService);

  // Reactive state with signals
  protected isLoading = signal(true);
  protected categories = signal<Category[]>([]);
  protected searchTerm = signal('');
  protected expandedCategories = signal<Record<string, boolean>>({});

  ngOnInit(): void {
    this.loadCategories();
  }

  protected loadCategories(): void {
    this.isLoading.set(true);
    this.productsService.getCategories().subscribe({
      next: (categories) => {
        // Organize categories into a hierarchical structure
        const rootCategories = categories.filter(cat => !cat.parent);

        // Sort by display_order and then by name
        rootCategories.sort((a, b) => {
          if (a.display_order !== b.display_order) {
            return a.display_order - b.display_order;
          }
          return a.name.localeCompare(b.name);
        });

        this.categories.set(rootCategories);
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
    if (this.searchTerm()) {
      this.isLoading.set(true);
      this.productsService.searchCategories(this.searchTerm()).subscribe({
        next: (categories) => {
          this.categories.set(categories);
          this.isLoading.set(false);
        },
        error: (error) => {
          console.error('Error searching categories:', error);
          this.toastService.error('Failed to search categories');
          this.isLoading.set(false);
        }
      });
    } else {
      this.loadCategories();
    }
  }

  protected toggleCategory(categoryId: string): void {
    this.expandedCategories.update(expanded => {
      const newExpanded = { ...expanded };
      newExpanded[categoryId] = !newExpanded[categoryId];
      return newExpanded;
    });
  }

  protected deleteCategory(id: string, event: Event): void {
    event.preventDefault();
    event.stopPropagation();

    if (confirm('Are you sure you want to delete this category?')) {
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

  protected isCategoryExpanded(categoryId: string): boolean {
    return !!this.expandedCategories()[categoryId];
  }

  protected getChildCategories(parentId: string): Category[] {
    return this.categories().filter(cat => cat.parent === parentId);
  }

  protected hasChildren(categoryId: string): boolean {
    return this.categories().some(cat => cat.parent === categoryId);
  }
}

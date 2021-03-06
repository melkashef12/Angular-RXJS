import {ChangeDetectionStrategy, Component} from '@angular/core';

import {BehaviorSubject, combineLatest, EMPTY, Observable, Subject, Subscription} from 'rxjs';

import {Product} from './product';
import {ProductService} from './product.service';
import {catchError, filter, map} from 'rxjs/operators';
import {ProductCategoryService} from '../product-categories/product-category.service';

@Component({
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css'],
  changeDetection : ChangeDetectionStrategy.OnPush
})
export class ProductListComponent  {
  pageTitle = 'Product List';
  errorMessage = '';
  categories;
  selectedCategoryId = 1;

  private categorySelectedSubject = new BehaviorSubject<number>(0);
  categorySelectedAction$ = this.categorySelectedSubject.asObservable();

  products$ = combineLatest([
    this.productService.productsWithAdd$,
    this.categorySelectedAction$
  ])
    .pipe(
    map(([products, selectedCategory]) => {
      return products.filter(product => selectedCategory ? product.categoryId === selectedCategory : true);
    }),
      catchError( err => {
      this.errorMessage = err;
      return EMPTY;
    })
  );

  categories$ = this.productCategoryService.$productCategories
    .pipe(
      catchError(err => {
        this.errorMessage = err;
        return EMPTY;
      })
    );

  sub: Subscription;

  constructor(private productService: ProductService,
              private productCategoryService: ProductCategoryService) { }

  onAdd(): void {
    this.productService.addNewProduct();
  }

  onSelected(categoryId: string): void {
    this.categorySelectedSubject.next( +categoryId);
  }
}

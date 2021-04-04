import {ChangeDetectionStrategy, Component, OnDestroy} from '@angular/core';

import {EMPTY, Subscription} from 'rxjs';

import {Product} from '../product';
import {ProductService} from '../product.service';
import {catchError} from 'rxjs/operators';

@Component({
  selector: 'pm-product-list',
  templateUrl: './product-list-alt.component.html',
  changeDetection : ChangeDetectionStrategy.OnPush
})
export class ProductListAltComponent implements  OnDestroy {
  pageTitle = 'Products';
  errorMessage = '';

  products: Product[] = [];
  sub: Subscription;

  products$ = this.productService.productsWithCategory$
    .pipe(
      catchError(err => {
        this.errorMessage = err;
        return EMPTY;
      })
    );

  selectedProduct$ = this.productService.selectedProduct$;

  constructor(private productService: ProductService) { }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  onSelected(productId: number): void {
    this.productService.selectedProductChanges(productId);
  }
}

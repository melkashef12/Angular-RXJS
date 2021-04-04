import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import {BehaviorSubject, combineLatest, merge, Observable, Subject, throwError} from 'rxjs';
import {catchError, filter, map, scan, tap} from 'rxjs/operators';

import { Product } from './product';
import { Supplier } from '../suppliers/supplier';
import { SupplierService } from '../suppliers/supplier.service';
import {ProductCategoryService} from '../product-categories/product-category.service';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private productsUrl = 'api/products';
  private suppliersUrl = this.supplierService.suppliersUrl;

  constructor(private http: HttpClient,
              private supplierService: SupplierService,
              private productCategoryService: ProductCategoryService) { }

  products$: Observable<Product[]> = this.http.get<Product[]>(this.productsUrl)
    .pipe(
      tap(data => console.log('Products: ', JSON.stringify(data))),
      catchError(this.handleError)
    );

  productsWithCategory$: Observable<Product[]> = combineLatest([
    this.products$,
    this.productCategoryService.$productCategories
    ]).pipe(
    map(([products, categories]) =>
      products.map(product => ({
        ...product,
        price: product.price * 1.5,
        searchKey: [product.productName],
        category: categories.find(c => product.categoryId === c.id).name
      }) as Product)
    ),

  );

  selectedProductSubject = new BehaviorSubject<number>(0);
  selectedProductAction$ = this.selectedProductSubject.asObservable();

  selectedProduct$ = combineLatest([
    this.productsWithCategory$,
    this.selectedProductAction$
  ])
    .pipe(
      map(([products, selectedProductId]) => products.find(product => product.id === selectedProductId)),
      tap(product => console.log('Selected product : ' + product ))
    );

  private productInsertedASubject = new Subject<Product>();
  productInsertedActions$ = this.productInsertedASubject.asObservable();

  productsWithAdd$ = merge(
    this.productsWithCategory$,
    this.productInsertedActions$
  )
    .pipe(
      scan((acc: Product[], value: Product) => [...acc, value] )
    );

  selectedProductChanges(selectedProductId: number): void {
    this.selectedProductSubject.next(+ selectedProductId);
  }

  addNewProduct(newProduct?: Product): void{
    newProduct = newProduct || this.fakeProduct();
    this.productInsertedASubject.next(newProduct);
  }

  private fakeProduct(): Product {
    return {
      id: 42,
      productName: 'Another One',
      productCode: 'TBX-0042',
      description: 'Our new product',
      price: 8.9,
      categoryId: 3,
      // category: 'Toolbox',
      quantityInStock: 30
    };
  }

  private handleError(err: any): Observable<never> {
    // in a real world app, we may send the server to some remote logging infrastructure
    // instead of just logging it to the console
    let errorMessage: string;
    if (err.error instanceof ErrorEvent) {
      // A client-side or network error occurred. Handle it accordingly.
      errorMessage = `An error occurred: ${err.error.message}`;
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong,
      errorMessage = `Backend returned code ${err.status}: ${err.body.error}`;
    }
    console.error(err);
    return throwError(errorMessage);
  }

}

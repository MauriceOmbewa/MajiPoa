import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VendorProducts } from './vendor-products';

describe('VendorProducts', () => {
  let component: VendorProducts;
  let fixture: ComponentFixture<VendorProducts>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VendorProducts]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VendorProducts);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VendorShop } from './vendor-shop';

describe('VendorShop', () => {
  let component: VendorShop;
  let fixture: ComponentFixture<VendorShop>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VendorShop]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VendorShop);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

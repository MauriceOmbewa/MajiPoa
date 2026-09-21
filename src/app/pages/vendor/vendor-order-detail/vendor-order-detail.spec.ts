import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VendorOrderDetail } from './vendor-order-detail';

describe('VendorOrderDetail', () => {
  let component: VendorOrderDetail;
  let fixture: ComponentFixture<VendorOrderDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VendorOrderDetail]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VendorOrderDetail);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

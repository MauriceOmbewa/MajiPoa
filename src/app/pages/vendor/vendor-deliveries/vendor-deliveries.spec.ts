import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VendorDeliveries } from './vendor-deliveries';

describe('VendorDeliveries', () => {
  let component: VendorDeliveries;
  let fixture: ComponentFixture<VendorDeliveries>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VendorDeliveries]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VendorDeliveries);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

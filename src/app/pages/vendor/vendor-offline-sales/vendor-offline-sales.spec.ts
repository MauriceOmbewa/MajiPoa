import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VendorOfflineSales } from './vendor-offline-sales';

describe('VendorOfflineSales', () => {
  let component: VendorOfflineSales;
  let fixture: ComponentFixture<VendorOfflineSales>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VendorOfflineSales]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VendorOfflineSales);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

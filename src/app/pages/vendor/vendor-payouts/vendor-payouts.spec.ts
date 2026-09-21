import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VendorPayouts } from './vendor-payouts';

describe('VendorPayouts', () => {
  let component: VendorPayouts;
  let fixture: ComponentFixture<VendorPayouts>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VendorPayouts]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VendorPayouts);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

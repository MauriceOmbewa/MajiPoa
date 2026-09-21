import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VendorVerification } from './vendor-verification';

describe('VendorVerification', () => {
  let component: VendorVerification;
  let fixture: ComponentFixture<VendorVerification>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VendorVerification]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VendorVerification);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

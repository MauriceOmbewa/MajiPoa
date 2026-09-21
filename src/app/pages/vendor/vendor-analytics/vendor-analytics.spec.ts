import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VendorAnalytics } from './vendor-analytics';

describe('VendorAnalytics', () => {
  let component: VendorAnalytics;
  let fixture: ComponentFixture<VendorAnalytics>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VendorAnalytics]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VendorAnalytics);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

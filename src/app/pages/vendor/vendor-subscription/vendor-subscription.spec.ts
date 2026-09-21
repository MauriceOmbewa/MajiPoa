import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VendorSubscription } from './vendor-subscription';

describe('VendorSubscription', () => {
  let component: VendorSubscription;
  let fixture: ComponentFixture<VendorSubscription>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VendorSubscription]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VendorSubscription);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

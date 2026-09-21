import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OfferingAvailability } from './offering-availability';

describe('OfferingAvailability', () => {
  let component: OfferingAvailability;
  let fixture: ComponentFixture<OfferingAvailability>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OfferingAvailability]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OfferingAvailability);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecurringDelivery } from './recurring-delivery';

describe('RecurringDelivery', () => {
  let component: RecurringDelivery;
  let fixture: ComponentFixture<RecurringDelivery>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecurringDelivery]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RecurringDelivery);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

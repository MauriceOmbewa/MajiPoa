import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrderConfirmed } from './order-confirmed';

describe('OrderConfirmed', () => {
  let component: OrderConfirmed;
  let fixture: ComponentFixture<OrderConfirmed>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrderConfirmed]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OrderConfirmed);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

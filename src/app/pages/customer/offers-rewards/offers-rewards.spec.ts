import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OffersRewards } from './offers-rewards';

describe('OffersRewards', () => {
  let component: OffersRewards;
  let fixture: ComponentFixture<OffersRewards>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OffersRewards]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OffersRewards);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

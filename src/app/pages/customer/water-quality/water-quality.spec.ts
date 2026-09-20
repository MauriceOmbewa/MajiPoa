import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WaterQuality } from './water-quality';

describe('WaterQuality', () => {
  let component: WaterQuality;
  let fixture: ComponentFixture<WaterQuality>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WaterQuality]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WaterQuality);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

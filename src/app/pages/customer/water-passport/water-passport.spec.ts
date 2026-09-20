import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WaterPassport } from './water-passport';

describe('WaterPassport', () => {
  let component: WaterPassport;
  let fixture: ComponentFixture<WaterPassport>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WaterPassport]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WaterPassport);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FindWater } from './find-water';

describe('FindWater', () => {
  let component: FindWater;
  let fixture: ComponentFixture<FindWater>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FindWater]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FindWater);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

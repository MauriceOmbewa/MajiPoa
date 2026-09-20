import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HelpComplaints } from './help-complaints';

describe('HelpComplaints', () => {
  let component: HelpComplaints;
  let fixture: ComponentFixture<HelpComplaints>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HelpComplaints]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HelpComplaints);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

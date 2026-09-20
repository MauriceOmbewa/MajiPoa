import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CorporateAccounts } from './corporate-accounts';

describe('CorporateAccounts', () => {
  let component: CorporateAccounts;
  let fixture: ComponentFixture<CorporateAccounts>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CorporateAccounts]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CorporateAccounts);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountAddresses } from './account-addresses';

describe('AccountAddresses', () => {
  let component: AccountAddresses;
  let fixture: ComponentFixture<AccountAddresses>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AccountAddresses]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AccountAddresses);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

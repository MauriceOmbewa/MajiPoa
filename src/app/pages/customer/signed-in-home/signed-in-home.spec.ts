import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SignedInHome } from './signed-in-home';

describe('SignedInHome', () => {
  let component: SignedInHome;
  let fixture: ComponentFixture<SignedInHome>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SignedInHome]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SignedInHome);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

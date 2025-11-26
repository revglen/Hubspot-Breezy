import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AllDeals } from './all-deals';

describe('AllDeals', () => {
  let component: AllDeals;
  let fixture: ComponentFixture<AllDeals>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AllDeals]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AllDeals);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

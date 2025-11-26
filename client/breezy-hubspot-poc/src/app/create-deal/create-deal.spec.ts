import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateDeal } from './create-deal';

describe('CreateDeal', () => {
  let component: CreateDeal;
  let fixture: ComponentFixture<CreateDeal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateDeal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateDeal);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

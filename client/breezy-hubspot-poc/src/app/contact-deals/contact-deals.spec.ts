import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContactDeals } from './contact-deals';

describe('ContactDeals', () => {
  let component: ContactDeals;
  let fixture: ComponentFixture<ContactDeals>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContactDeals]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ContactDeals);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActiveSubscriptions } from './active-subscriptions';

describe('ActiveSubscriptions', () => {
  let component: ActiveSubscriptions;
  let fixture: ComponentFixture<ActiveSubscriptions>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActiveSubscriptions]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ActiveSubscriptions);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

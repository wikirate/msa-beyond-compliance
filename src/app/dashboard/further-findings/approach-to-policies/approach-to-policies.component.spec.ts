import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApproachToPoliciesComponent } from './approach-to-policies.component';

describe('ApproachToPoliciesComponent', () => {
  let component: ApproachToPoliciesComponent;
  let fixture: ComponentFixture<ApproachToPoliciesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ApproachToPoliciesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ApproachToPoliciesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

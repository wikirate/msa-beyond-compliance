import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MinimumRequirementsSectionComponent } from './minimum-requirements-section.component';

describe('MinimumRequirementsSectionComponent', () => {
  let component: MinimumRequirementsSectionComponent;
  let fixture: ComponentFixture<MinimumRequirementsSectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MinimumRequirementsSectionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MinimumRequirementsSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

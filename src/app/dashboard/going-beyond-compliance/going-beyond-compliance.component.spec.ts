import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GoingBeyondComplianceComponent } from './going-beyond-compliance.component';

describe('GoingBeyondComplianceComponent', () => {
  let component: GoingBeyondComplianceComponent;
  let fixture: ComponentFixture<GoingBeyondComplianceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GoingBeyondComplianceComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GoingBeyondComplianceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

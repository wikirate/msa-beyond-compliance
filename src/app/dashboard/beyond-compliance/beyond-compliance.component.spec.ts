import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BeyondComplianceComponent } from './beyond-compliance.component';

describe('BeyondComplianceComponent', () => {
  let component: BeyondComplianceComponent;
  let fixture: ComponentFixture<BeyondComplianceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BeyondComplianceComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BeyondComplianceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApproachToRisksComponent } from './approach-to-risks.component';

describe('ApproachToRisksComponent', () => {
  let component: ApproachToRisksComponent;
  let fixture: ComponentFixture<ApproachToRisksComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ApproachToRisksComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ApproachToRisksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

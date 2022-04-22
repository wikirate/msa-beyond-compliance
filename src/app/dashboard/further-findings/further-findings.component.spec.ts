import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FurtherFindingsComponent } from './further-findings.component';

describe('FurtherFindingsComponent', () => {
  let component: FurtherFindingsComponent;
  let fixture: ComponentFixture<FurtherFindingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FurtherFindingsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FurtherFindingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

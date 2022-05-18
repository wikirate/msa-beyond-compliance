import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssessedStatementsOverviewComponent } from './assessed-statements-overview.component';

describe('TreemapComponent', () => {
  let component: AssessedStatementsOverviewComponent;
  let fixture: ComponentFixture<AssessedStatementsOverviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AssessedStatementsOverviewComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AssessedStatementsOverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

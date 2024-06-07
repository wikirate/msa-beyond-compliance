import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HighlightMetricComponent } from './highlight-metric.component';

describe('HighlightMetricComponent', () => {
  let component: HighlightMetricComponent;
  let fixture: ComponentFixture<HighlightMetricComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HighlightMetricComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HighlightMetricComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

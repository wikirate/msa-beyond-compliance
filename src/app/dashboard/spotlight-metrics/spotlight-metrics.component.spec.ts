import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SpotlightMetricsComponent } from './spotlight-metrics.component';

describe('SpotlightMetricsComponent', () => {
  let component: SpotlightMetricsComponent;
  let fixture: ComponentFixture<SpotlightMetricsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SpotlightMetricsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SpotlightMetricsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

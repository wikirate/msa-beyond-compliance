import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IntroductorySectionComponent } from './introductory-section.component';

describe('IntroductorySectionComponent', () => {
  let component: IntroductorySectionComponent;
  let fixture: ComponentFixture<IntroductorySectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ IntroductorySectionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(IntroductorySectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

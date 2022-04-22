import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KeyFindingsSectionComponent } from './key-findings-section.component';

describe('KeyFindingsSectionComponent', () => {
  let component: KeyFindingsSectionComponent;
  let fixture: ComponentFixture<KeyFindingsSectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ KeyFindingsSectionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(KeyFindingsSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

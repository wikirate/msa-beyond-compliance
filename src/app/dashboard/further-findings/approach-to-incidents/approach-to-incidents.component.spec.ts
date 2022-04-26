import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApproachToIncidentsComponent } from './approach-to-incidents.component';

describe('ApproachToIncidentsComponent', () => {
  let component: ApproachToIncidentsComponent;
  let fixture: ComponentFixture<ApproachToIncidentsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ApproachToIncidentsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ApproachToIncidentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

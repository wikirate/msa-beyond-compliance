import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DisclosureRatesComponent } from './disclosure-rates.component';

describe('DisclosureRatesComponent', () => {
  let component: DisclosureRatesComponent;
  let fixture: ComponentFixture<DisclosureRatesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DisclosureRatesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DisclosureRatesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

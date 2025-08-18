import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GlobalProgressBarComponent } from './global-progress-bar.component';

describe('GlobalProgressBarComponent', () => {
  let component: GlobalProgressBarComponent;
  let fixture: ComponentFixture<GlobalProgressBarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GlobalProgressBarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GlobalProgressBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

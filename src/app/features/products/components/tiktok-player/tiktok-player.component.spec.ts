import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TiktokPlayerComponent } from './tiktok-player.component';

describe('TiktokPlayerComponent', () => {
  let component: TiktokPlayerComponent;
  let fixture: ComponentFixture<TiktokPlayerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TiktokPlayerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TiktokPlayerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

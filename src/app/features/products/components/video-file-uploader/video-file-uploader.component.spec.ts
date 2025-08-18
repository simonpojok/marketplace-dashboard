import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VideoFileUploaderComponent } from './video-file-uploader.component';

describe('VideoFileUploaderComponent', () => {
  let component: VideoFileUploaderComponent;
  let fixture: ComponentFixture<VideoFileUploaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VideoFileUploaderComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VideoFileUploaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

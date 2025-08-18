import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VideoMetadataFormComponent } from './video-metadata-form.component';

describe('VideoMetadataFormComponent', () => {
  let component: VideoMetadataFormComponent;
  let fixture: ComponentFixture<VideoMetadataFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VideoMetadataFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VideoMetadataFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

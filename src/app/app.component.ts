import { Component, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements AfterViewInit {
  title = 'devu_vignesh_wedding';
  isMuted = false;

  @ViewChild('audioPlayer') audioPlayer!: ElementRef<HTMLAudioElement>;

  ngAfterViewInit() {
    const audio = this.audioPlayer.nativeElement;
    // Try to play unmuted
    audio.play().catch(error => {
      console.log('Autoplay unmuted failed, falling back to muted autoplay:', error);
      audio.muted = true;
      this.isMuted = true;
      audio.play().catch(e => console.error('Muted autoplay also failed:', e));

      // Listen for first click anywhere on the document to unmute
      const unmuteOnInteraction = () => {
        if (this.isMuted) {
          audio.muted = false;
          this.isMuted = false;
          audio.play().catch(e => console.error('Play failed on interaction:', e));
        }
        document.removeEventListener('click', unmuteOnInteraction);
        document.removeEventListener('touchstart', unmuteOnInteraction);
      };
      document.addEventListener('click', unmuteOnInteraction);
      document.addEventListener('touchstart', unmuteOnInteraction);
    });
  }

  toggleMute() {
    const audio = this.audioPlayer.nativeElement;
    if (this.isMuted) {
      audio.muted = false;
      this.isMuted = false;
      audio.play().catch(error => {
        console.error('Error playing audio:', error);
      });
    } else {
      audio.muted = true;
      this.isMuted = true;
    }
  }
}

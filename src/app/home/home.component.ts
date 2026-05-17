import { Component, AfterViewInit, ElementRef, ViewChildren, QueryList, PLATFORM_ID, Inject, OnInit, OnDestroy, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class HomeComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChildren('scratchCanvas') scratchCanvases!: QueryList<ElementRef<HTMLCanvasElement>>;

  activeStoryIndex: number = 0;
  showSplash: boolean = true;
  days: number = 0;
  hours: number = 0;
  minutes: number = 0;
  seconds: number = 0;
  private timerInterval: any;
  private canvases: { el: HTMLCanvasElement, ctx: CanvasRenderingContext2D, isDrawing: boolean }[] = [];
  private scrollRevealObserver: IntersectionObserver | null = null;

  storyStages = [
    {
      subtitle: 'A GLIMPSE OF OUR JOURNEY',
      title: 'Our <span>Story</span>',
      pill: 'MAKING IT OFFICIAL',
      quote: 'Somewhere between the inside jokes and late night calls,',
      quoteEmphasized: 'we realized this was it.',
      image: 'assets/images/story_1.jpeg',
      caption: '... and it all began'
    },
    {
      subtitle: 'THE PROPOSAL',
      title: 'The <span>Beginning</span>',
      pill: 'YES, A THOUSAND TIMES!',
      quote: 'Under the starlit sky, with a heart full of hope,',
      quoteEmphasized: 'she said yes.',
      image: 'assets/images/story_2.jpeg',
      caption: 'Building memories'
    },
    {
      subtitle: 'LITTLE MOMENTS',
      title: 'Our <span>Bond</span>',
      pill: 'BETTER TOGETHER',
      quote: 'It’s the simple things - coffee dates and long walks,',
      quoteEmphasized: 'that made us inseparable.',
      image: 'assets/images/story_3.jpeg',
      caption: 'Every moment counts'
    },
    {
      subtitle: 'TILL ETERNITY',
      title: 'The <span>Promise</span>',
      pill: 'FOREVER TO GO',
      quote: 'Hand in hand, we step into a new chapter,',
      quoteEmphasized: 'promising a lifetime of love.',
      image: 'assets/images/story_4.jpeg',
      caption: 'Forever to go'
    }
  ];

  constructor(@Inject(PLATFORM_ID) private platformId: Object) { }

  ngOnInit() {
    this.calculateCountdown();
    if (isPlatformBrowser(this.platformId)) {
      this.timerInterval = setInterval(() => this.calculateCountdown(), 1000);
    }
  }

  ngAfterViewInit() {
    if (isPlatformBrowser(this.platformId)) {
      setTimeout(() => {
        this.initAllCanvases();
        this.initScrollObserver();
        this.initScrollReveal();
      }, 500);

      // Fallback to hide splash screen after 5 seconds in case Lottie fails
      setTimeout(() => {
        this.showSplash = false;
      }, 5000);
    }
  }

  private initScrollObserver() {
    const track = document.querySelector('.story-carousel-track');
    const observerOptions = {
      root: track,
      rootMargin: '0px',
      threshold: 0.6
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const index = parseInt(entry.target.getAttribute('data-index') || '0');
          this.activeStoryIndex = index;
        }
      });
    }, observerOptions);

    const slides = document.querySelectorAll('.photo-slide');
    slides.forEach(slide => observer.observe(slide));
  }

  private initScrollReveal() {
    const revealClasses = [
      '.reveal', '.reveal-left', '.reveal-right',
      '.reveal-bounce', '.reveal-pop'
    ];
    const selector = revealClasses.join(', ');
    const elements = document.querySelectorAll(selector);

    this.scrollRevealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            // Unobserve after first reveal so animation fires only once
            this.scrollRevealObserver?.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -50px 0px' }
    );

    elements.forEach(el => this.scrollRevealObserver!.observe(el));
  }

  ngOnDestroy() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
    if (this.scrollRevealObserver) {
      this.scrollRevealObserver.disconnect();
    }
  }

  onLottieComplete() {
    this.showSplash = false;
  }

  calculateCountdown() {
    const targetDate = new Date('2026-07-12T00:00:00');
    const now = new Date();
    const diff = targetDate.getTime() - now.getTime();

    if (diff <= 0) {
      this.days = this.hours = this.minutes = this.seconds = 0;
      return;
    }

    this.days = Math.floor(diff / (1000 * 60 * 60 * 24));
    this.hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    this.minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    this.seconds = Math.floor((diff % (1000 * 60)) / 1000);
  }

  initAllCanvases() {
    this.canvases = []; // Clear existing to prevent duplicates
    this.scratchCanvases.forEach((canvasRef, index) => {
      const canvas = canvasRef.nativeElement;
      const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
      const canvasObj = { el: canvas, ctx: ctx, isDrawing: false };
      this.canvases.push(canvasObj);

      const resize = () => {
        const parent = canvas.parentElement;
        if (parent) {
          canvas.width = parent.offsetWidth;
          canvas.height = parent.offsetHeight;
          this.fillCanvas(canvasObj);
        }
      };

      resize();
      window.addEventListener('resize', resize);

      // Mouse Events
      canvas.addEventListener('mousedown', (e) => this.startDrawing(canvasObj, e));
      canvas.addEventListener('mousemove', (e) => this.draw(canvasObj, e));
      canvas.addEventListener('mouseup', () => this.stopDrawing(canvasObj));
      canvas.addEventListener('mouseleave', () => this.stopDrawing(canvasObj));

      // Touch Events
      canvas.addEventListener('touchstart', (e) => {
        e.preventDefault();
        const touch = e.touches[0];
        this.startDrawing(canvasObj, { clientX: touch.clientX, clientY: touch.clientY } as MouseEvent);
      });
      canvas.addEventListener('touchmove', (e) => {
        e.preventDefault();
        const touch = e.touches[0];
        this.draw(canvasObj, { clientX: touch.clientX, clientY: touch.clientY } as MouseEvent);
      });
      canvas.addEventListener('touchend', () => this.stopDrawing(canvasObj));
    });
  }

  fillCanvas(canvasObj: any) {
    const { el, ctx } = canvasObj;
    const gradient = ctx.createLinearGradient(0, 0, el.width, el.height);
    gradient.addColorStop(0, '#f48b8b');
    gradient.addColorStop(0.5, '#fcebeb');
    gradient.addColorStop(1, '#f48b8b');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, el.width, el.height);

    ctx.fillStyle = '#8d5e5e';
    ctx.font = '700 12px "Inter", sans-serif';
    ctx.textAlign = 'center';
    ctx.letterSpacing = '2px';
    ctx.fillText('SCRATCH', el.width / 2, el.height / 2 + 5);
  }

  startDrawing(canvasObj: any, e: MouseEvent) {
    canvasObj.isDrawing = true;
    this.draw(canvasObj, e);
  }

  draw(canvasObj: any, e: MouseEvent) {
    if (!canvasObj.isDrawing) return;

    const { el, ctx } = canvasObj;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(x, y, 20, 0, Math.PI * 2);
    ctx.fill();

    this.checkRevealProgress(canvasObj);
  }

  allScratched: boolean = false;
  private revealedCount: number = 0;

  checkRevealProgress(canvasObj: any) {
    const { el, ctx } = canvasObj;
    if (el.style.display === 'none') return;

    const imageData = ctx.getImageData(0, 0, el.width, el.height);
    const pixels = imageData.data;
    let transparentPixels = 0;

    for (let i = 0; i < pixels.length; i += 4) {
      if (pixels[i + 3] === 0) transparentPixels++;
    }

    const percentage = (transparentPixels / (pixels.length / 4)) * 100;
    if (percentage > 50) {
      el.style.transition = 'opacity 0.5s ease-out';
      el.style.opacity = '0';
      setTimeout(() => {
        el.style.display = 'none';
        this.revealedCount++;
        if (this.revealedCount >= this.canvases.length) {
          this.allScratched = true;
        }
      }, 500);
    }
  }

  stopDrawing(canvasObj: any) {
    canvasObj.isDrawing = false;
  }

  scrollToSaveTheDate() {
    const element = document.getElementById('save-the-date');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }
}

import { Component, ElementRef, ViewChild } from '@angular/core';
import { MatSliderModule } from '@angular/material/slider';

@Component({
  selector: 'fourier-square',
  standalone: true,
  imports: [MatSliderModule],
  templateUrl: './fourier-square.component.html',
  styleUrl: './fourier-square.component.scss'
})
export class FourierSquareComponent {

  @ViewChild('canvas') canvas!: ElementRef<HTMLCanvasElement>;

  private ctx: CanvasRenderingContext2D | null = null;
  terms: number = 10;

  handleValueChanged(event: Event) {
    this.terms = parseInt((event.target as HTMLInputElement).value)
    this.drawFourierSquareWave()
  }

  public ngAfterViewInit() {
    // get the context
    const canvasEl: HTMLCanvasElement = this.canvas.nativeElement;
    if (canvasEl) {
      this.ctx = canvasEl.getContext('2d');
    }

    this.drawFourierSquareWave();
  }

  drawFourierSquareWave() {
    if (!this.ctx) {
      console.error(`Could not get canvas context`)
      return
    }

    const canvas = this.canvas.nativeElement;
    const ctx = this.ctx
    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);

    // Draw square wave
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#ff0000';
    ctx.beginPath();
    const maxHeight = (4 / Math.PI) * height * 0.63;
    const offset = 0.1 * height;
    ctx.moveTo(0, offset);
    for (let i = 0; i < 4; i++) {
      ctx.lineTo(0 + 0.25 * width * i, offset);
      ctx.lineTo(0 + 0.25 * width * i, maxHeight * ((i + 1) % 2) + offset);
      ctx.lineTo(0 + 0.25 * width * (i + 1), maxHeight * ((i + 1) % 2) + offset);
      ctx.stroke();
    }

    ctx.lineWidth = 1;
    ctx.strokeStyle = '#000000';
    ctx.beginPath();

    const period = 2.0 + Math.PI;
    for (let ix = 0; ix < 1000; ix++) {
      const x = 2.0 * period * (ix / 1000);
      let y = 0;
      for (let k = 1; k <= this.terms; k += 2) {
        const amplitude = 4 / (k * Math.PI);
        y += amplitude * Math.sin(k * x * 2 * Math.PI / period);
      }
      ctx.lineTo(x * width / (2.0 * period), y * height * 0.5 * 0.8 + 0.5 * height);
    }

    ctx.stroke();
  }

  saveCanvas() {
    const canvas = this.canvas.nativeElement;
    const dataURL = canvas.toDataURL(); // Default format is PNG

    const link = document.createElement('a');
    link.href = dataURL;
    link.download = 'my-canvas.png';
    link.click();
  }
}

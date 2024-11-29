import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FourierSquareComponent } from './fourier-square/fourier-square.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, FourierSquareComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'tools';
}

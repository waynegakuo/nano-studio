import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Snowflake {
  left: string;
  animationDuration: string;
  animationDelay: string;
  fontSize: string;
}

@Component({
  selector: 'app-festive-decorations',
  imports: [CommonModule],
  templateUrl: './festive-decorations.html',
  styleUrl: './festive-decorations.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class FestiveDecorations implements OnInit {
  snowflakes: Snowflake[] = [];

  ngOnInit() {
    this.snowflakes = Array.from({ length: 100 }, () => ({
      left: `${Math.random() * 100}vw`,
      animationDuration: `${Math.random() * 5 + 5}s`,
      animationDelay: `${Math.random() * -5}s`,
      fontSize: `${Math.random() * 0.5 + 0.5}rem`,
    }));
  }
}

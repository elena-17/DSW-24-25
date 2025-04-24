import {
  Component,
  ElementRef,
  HostListener,
  Input,
  AfterViewInit,
  ViewChild,
  Output,
  EventEmitter,
} from "@angular/core";
import { CommonModule } from "@angular/common";

@Component({
  selector: "app-slider",
  imports: [CommonModule],
  templateUrl: "./slider.component.html",
  styleUrl: "./slider.component.scss",
})
export class SliderComponent {
  @Input() min = 0;
  @Input() max = 100000;
  @Input() step = 1;
  @Input() startValue = 0;
  @Input() endValue = 100000;

  @ViewChild("sliderTrack", { static: true })
  sliderTrack!: ElementRef<HTMLDivElement>;
  sliderWidth = 0;
  dragging: "start" | "end" | null = null;

  ngAfterViewInit(): void {
    this.sliderWidth = this.sliderTrack.nativeElement.offsetWidth;
  }

  get startPercent(): number {
    return ((this.startValue - this.min) / (this.max - this.min)) * 100;
  }

  get endPercent(): number {
    return ((this.endValue - this.min) / (this.max - this.min)) * 100;
  }

  onMouseDown(thumb: "start" | "end", event: MouseEvent) {
    event.preventDefault();
    this.dragging = thumb;
  }

  @HostListener("window:mouseup")
  onMouseUp() {
    this.dragging = null;
  }

  @HostListener("window:mousemove", ["$event"])
  onMouseMove(event: MouseEvent) {
    if (!this.dragging) {
      return;
    }
    const rect = this.sliderTrack.nativeElement.getBoundingClientRect();
    const x = event.clientX - rect.left;
    let percent = (x / this.sliderWidth) * 100;
    percent = Math.max(0, Math.min(100, percent));
    const value = this.min + ((this.max - this.min) * percent) / 100;
    // Redondea al step definido
    const steppedValue = Math.round(value / this.step) * this.step;
    if (this.dragging === "start") {
      // El valor mínimo no debe superar el valor máximo
      this.startValue = Math.min(steppedValue, this.endValue);
    } else if (this.dragging === "end") {
      // El valor máximo no debe ser menor que el valor mínimo
      this.endValue = Math.max(steppedValue, this.startValue);
    }
    this.onSliderChange();
  }

  @Output() rangeChange = new EventEmitter<{ start: number; end: number }>();

  onSliderChange() {
    this.rangeChange.emit({
      start: this.startValue,
      end: this.endValue,
    });
  }
}

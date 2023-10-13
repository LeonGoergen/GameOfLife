import { Directive, ElementRef, EventEmitter, Input, Output, HostListener } from '@angular/core';
import { TransformationMatrixService } from '../../services/transformation-matrix.service';
import { DrawingContext } from '../../models/drawing-context.model';
import {MAIN_GRID_CONSTANTS} from "../../app.constants";

@Directive({
  selector: '[appCanvasZoom]'
})
export class CanvasZoomDirective {
  @Input() gridSize!: number;
  @Input() transformationMatrix!: any;
  @Input() drawingContext!: DrawingContext;
  @Output() zoomRequested: EventEmitter<{ x: number; y: number; amount: number }> = new EventEmitter<{
    x: number;
    y: number;
    amount: number;
  }>();

  private initialPinchDistance: number = 0;

  constructor(
    private el: ElementRef,
    private transformationMatrixService: TransformationMatrixService
  ) {}

  @HostListener('wheel', ['$event'])
  @HostListener('touchstart', ['$event'])
  handleZoom(event: WheelEvent | TouchEvent): void {
    event.preventDefault();

    if (event instanceof WheelEvent) {
      this.handleMouseWheelZoom(event);
    } else if (event.touches && event.touches.length === 2) {
      this.handlePinchZoom(event);
    }
  }

  private handleMouseWheelZoom(event: WheelEvent): void {
    const rect: DOMRect = (this.el.nativeElement as HTMLElement).getBoundingClientRect();

    const x: number = event.clientX - rect.left;
    const y: number = event.clientY - rect.top;
    const amount: number = 1 - event.deltaY * MAIN_GRID_CONSTANTS.ZOOM_FACTOR;

    this.transformationMatrix = this.transformationMatrixService.scaleAt(this.transformationMatrix, this.drawingContext, { x, y }, amount, this.gridSize);

    this.zoomRequested.emit({ x, y, amount });
  }

  private handlePinchZoom(event: TouchEvent): void {
    const touch1 = event.touches[0];
    const touch2 = event.touches[1];

    if (!touch1 || !touch2) return;

    const x1: number = touch1.clientX;
    const y1: number = touch1.clientY;
    const x2: number = touch2.clientX;
    const y2: number = touch2.clientY;

    const currentPinchDistance = Math.hypot(x1 - x2, y1 - y2);

    if (this.initialPinchDistance === 0) {
      this.initialPinchDistance = currentPinchDistance;
      return;
    }

    const amount = currentPinchDistance / this.initialPinchDistance;

    this.initialPinchDistance = currentPinchDistance;

    const x = (x1 + x2) / 2;
    const y = (y1 + y2) / 2;

    this.transformationMatrix = this.transformationMatrixService.scaleAt(this.transformationMatrix, this.drawingContext, { x, y }, amount, this.gridSize);

    this.zoomRequested.emit({ x, y, amount });
  }

  @HostListener('touchend')
  resetInitialPinchDistance(): void {
    this.initialPinchDistance = 0;
  }
}

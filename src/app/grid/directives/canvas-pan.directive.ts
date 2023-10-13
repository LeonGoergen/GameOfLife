import { Directive, ElementRef, EventEmitter, HostListener, Input, Output } from '@angular/core';
import { TransformationMatrixService } from "../../services/transformation-matrix.service";
import { DrawingContext } from "../../models/drawing-context.model";

@Directive({
  selector: '[appCanvasPan]'
})
export class CanvasPanDirective {
  private isPanning: boolean = false;
  private lastPanX: number = 0;
  private lastPanY: number = 0;
  private totalPanDistance: number = 0;

  @Input() gridSize!: number;
  @Input() transformationMatrix!: any;
  @Input() drawingContext!: DrawingContext;
  @Output() panUpdated: EventEmitter<number> = new EventEmitter<number>();

  constructor(
    private el: ElementRef,
    private transformationMatrixService: TransformationMatrixService
  ) {}

  @HostListener('mousedown', ['$event'])
  @HostListener('touchstart', ['$event'])
  startPan(event: MouseEvent | TouchEvent): void {
    this.isPanning = true;
    this.lastPanX = this.getEventX(event);
    this.lastPanY = this.getEventY(event);
    this.totalPanDistance = 0;
  }

  @HostListener('mousemove', ['$event'])
  @HostListener('touchmove', ['$event'])
  pan(event: MouseEvent | TouchEvent): void {
    if (!this.isPanning) { return; }

    const deltaX: number = this.getEventX(event) - this.lastPanX;
    const deltaY: number = this.getEventY(event) - this.lastPanY;

    this.transformationMatrix = this.transformationMatrixService.translate(this.transformationMatrix, this.drawingContext, deltaX, deltaY, this.gridSize);

    this.lastPanX = this.getEventX(event);
    this.lastPanY = this.getEventY(event);
    this.totalPanDistance += Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    this.panUpdated.emit(this.totalPanDistance);
  }

  @HostListener('mouseup')
  @HostListener('touchend')
  endPan(): void {
    this.isPanning = false;
  }

  private getEventX(event: MouseEvent | TouchEvent): number {
    if (event instanceof MouseEvent) {
      return event.clientX;
    } else if (event.touches && event.touches.length > 0) {
      return event.touches[0].clientX;
    }
    return 0;
  }

  private getEventY(event: MouseEvent | TouchEvent): number {
    if (event instanceof MouseEvent) {
      return event.clientY;
    } else if (event.touches && event.touches.length > 0) {
      return event.touches[0].clientY;
    }
    return 0;
  }
}

import {Directive, ElementRef, EventEmitter, HostListener, Input, Output} from '@angular/core';
import {TransformationMatrixService} from "../../services/transformation-matrix.service";

@Directive({
  selector: '[appCanvasPan]'
})
export class CanvasPanDirective {
  private isPanning: boolean = false;
  private lastPanX: number = 0;
  private lastPanY: number = 0;
  private totalPanDistance: number = 0;

  @Input() gridSize!: number;
  @Output() panUpdated: EventEmitter<number> = new EventEmitter<number>();

  constructor(
    private el: ElementRef,
    private transformationMatrixService: TransformationMatrixService
  ) {}

  @HostListener('mousedown', ['$event'])
  startPan(event: MouseEvent): void {
    this.isPanning = true;
    this.lastPanX = event.clientX;
    this.lastPanY = event.clientY;
    this.totalPanDistance = 0;
  }

  @HostListener('mousemove', ['$event'])
  pan(event: MouseEvent): void {
    if (!this.isPanning) { return; }

    const deltaX: number = event.clientX - this.lastPanX;
    const deltaY: number = event.clientY - this.lastPanY;

    this.transformationMatrixService.translate(deltaX, deltaY, this.gridSize);

    this.lastPanX = event.clientX;
    this.lastPanY = event.clientY;
    this.totalPanDistance += Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    this.panUpdated.emit(this.totalPanDistance);
  }

  @HostListener('mouseup', ['$event'])
  endPan(): void {
    this.isPanning = false;
  }
}

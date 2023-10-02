import {Directive, ElementRef, EventEmitter, HostListener, Input, Output} from '@angular/core';
import {GRID_CONSTANTS} from "../../app.constants";
import {TransformationMatrixService} from "../../services/transformation-matrix.service";

@Directive({
  selector: '[appCanvasZoom]'
})
export class CanvasZoomDirective {
  @Input() gridSize!: number;
  @Input() transformationMatrix!: any;
  @Output() zoomRequested: EventEmitter<{ x: number, y: number, amount: number }> = new EventEmitter<{ x: number, y: number, amount: number }>();

  constructor(private el: ElementRef,
              private transformationMatrixService: TransformationMatrixService) {}

  @HostListener('wheel', ['$event'])
  handleZoom(event: WheelEvent): void {
    event.preventDefault();

    const rect: DOMRect = (this.el.nativeElement as HTMLElement).getBoundingClientRect();

    const x: number = event.clientX - rect.left;
    const y: number = event.clientY - rect.top;
    const amount: number = 1 - event.deltaY * GRID_CONSTANTS.ZOOM_FACTOR;

    this.transformationMatrix = this.transformationMatrixService.scaleAt(this.transformationMatrix, { x, y }, amount, this.gridSize);

    this.zoomRequested.emit({ x, y, amount });
  }
}

import {Directive, ElementRef, EventEmitter, HostListener, Input, Output} from '@angular/core';
import {GRID_CONSTANTS} from "../../app.constants";
import {TransformationMatrixService} from "../../services/transformation-matrix.service";

@Directive({
  selector: '[appCanvasClick]'
})
export class CanvasClickDirective {
  @Input() totalPanDistance!: number;
  @Output() canvasClicked: EventEmitter<string> = new EventEmitter<string>();
  @Output() rightClicked: EventEmitter<string> = new EventEmitter<string>();

  constructor(private el: ElementRef,
              private transformationMatrixService: TransformationMatrixService) {}

  @HostListener('click', ['$event'])
  handleCanvasClick(event: MouseEvent): void {
    if (this.totalPanDistance > GRID_CONSTANTS.PAN_DISTANCE_THRESHOLD) { return; }

    const key: string = this.getCellKeyByCoordinates(event);
    this.canvasClicked.emit(key);
  }

  @HostListener('contextmenu', ['$event'])
  handleRightClick(event: MouseEvent): void {
    event.preventDefault();
    const key: string = this.getCellKeyByCoordinates(event);
    this.rightClicked.emit(key);
  }

  private getCellKeyByCoordinates(event: MouseEvent): string {
    const rect: DOMRect = (this.el.nativeElement as HTMLElement).getBoundingClientRect();

    const x: number = event.clientX - rect.left;
    const y: number = event.clientY - rect.top;

    const inverseMatrix: number[] = this.transformationMatrixService.inverseMatrix;
    const worldPoint: {x: number, y:number} = this.transformationMatrixService.transformPoint({ x, y }, inverseMatrix);

    const cellX: number = Math.floor(worldPoint.x / GRID_CONSTANTS.CELL_SIZE) * GRID_CONSTANTS.CELL_SIZE;
    const cellY: number = Math.floor(worldPoint.y / GRID_CONSTANTS.CELL_SIZE) * GRID_CONSTANTS.CELL_SIZE;
    return `${cellX},${cellY}`;
  }
}

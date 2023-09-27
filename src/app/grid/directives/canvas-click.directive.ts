import {Directive, ElementRef, EventEmitter, HostListener, Input, Output} from '@angular/core';
import {GRID_CONSTANTS} from "../../app.constants";
import {TransformationMatrixService} from "../../services/transformation-matrix.service";
import {MatDialog, MatDialogConfig, MatDialogRef} from "@angular/material/dialog";
import {ContextMenuComponent} from "../context-menu/context-menu.component";

@Directive({
  selector: '[appCanvasClick]'
})
export class CanvasClickDirective {
  @Input() totalPanDistance!: number;
  @Output() canvasClicked: EventEmitter<string> = new EventEmitter<string>();
  @Output() rightClicked: EventEmitter<{ key: string; rleString: string }> = new EventEmitter<{ key: string; rleString: string }>();

  constructor(private el: ElementRef,
              private transformationMatrixService: TransformationMatrixService,
              public dialog: MatDialog) {}

  @HostListener('click', ['$event'])
  handleCanvasClick(event: MouseEvent): void {
    if (this.totalPanDistance > GRID_CONSTANTS.PAN_DISTANCE_THRESHOLD) { return; }
    const key: string = this.getCellKeyByCoordinates(event);
    this.canvasClicked.emit(key);
  }

  @HostListener('contextmenu', ['$event'])
  async handleRightClick(event: MouseEvent): Promise<void> {
    event.preventDefault();
    const key: string = this.getCellKeyByCoordinates(event);
    const dialogConfig: MatDialogConfig = new MatDialogConfig();
    dialogConfig.data = { cellKey: key };
    dialogConfig.position = { left: `${event.clientX}px`, top: `${event.clientY}px` };
    const dialogRef: MatDialogRef<ContextMenuComponent> = this.dialog.open(ContextMenuComponent, dialogConfig);
    const result = await dialogRef.afterClosed().toPromise();

    switch (result?.action) {
      case 'paste':
        const rleStringPaste: string = result?.rleString;
        this.rightClicked.emit({key, rleString: rleStringPaste});
        break;
      case 'insert':
        const rleStringInsert: string = result?.rleString;
        this.rightClicked.emit({key, rleString: rleStringInsert});
        break;
    }
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

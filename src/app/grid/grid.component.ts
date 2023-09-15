import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {QuadTree} from "./quadtree/quadtree.model";
import {GRID_CONSTANTS} from "../app.constants";

@Component({
  selector: 'app-grid',
  templateUrl: './grid.component.html',
  styleUrls: ['./grid.component.css']
})
export class GridComponent implements OnInit {
  @ViewChild('gridCanvas', { static: true }) gridCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('gameCanvas', { static: true }) gameCanvas!: ElementRef<HTMLCanvasElement>;

  private gridCtx!: CanvasRenderingContext2D;
  private gameCtx!: CanvasRenderingContext2D;
  private quadtree!: QuadTree;
  private gridSize!: number;

  private transformMatrix = {
    scaleX: 1,
    skewY: 0,
    skewX: 0,
    scaleY: 1,
    translateX: 0,
    translateY: 0,
  };
  private panConfig = {
    isPanning: false,
    lastPanX: 0,
    lastPanY: 0,
    totalPanDistance: 0,
  };

  ngOnInit(): void {
    this.gridSize = GRID_CONSTANTS.GRID_SIZE;

    this.gridCtx = this.gridCanvas.nativeElement.getContext('2d')!;
    this.gameCtx = this.gameCanvas.nativeElement.getContext('2d')!;
    this.drawGridLines();

    this.quadtree = new QuadTree(0, 0, this.gridSize, this.gridSize);
  }

  drawGridLines(): void {
    this.gridCtx.clearRect(0, 0, this.gridSize, this.gridSize);
    this.gridCtx.setTransform(
      this.transformMatrix.scaleX,
      this.transformMatrix.skewY,
      this.transformMatrix.skewX,
      this.transformMatrix.scaleY,
      this.transformMatrix.translateX,
      this.transformMatrix.translateY
    );

    this.gridCtx.strokeStyle = '#000';

    // Draw horizontal lines
    for (let y = 0; y <= this.gridSize; y += GRID_CONSTANTS.CELL_SIZE) {
      this.gridCtx.beginPath();
      this.gridCtx.moveTo(0, y);
      this.gridCtx.lineTo(this.gridSize, y);
      this.gridCtx.stroke();
    }

    // Draw vertical lines
    for (let x = 0; x <= this.gridSize; x += GRID_CONSTANTS.CELL_SIZE) {
      this.gridCtx.beginPath();
      this.gridCtx.moveTo(x, 0);
      this.gridCtx.lineTo(x, this.gridSize);
      this.gridCtx.stroke();
    }
  }

  startPan(event: MouseEvent): void {
    this.panConfig.isPanning = true;
    this.panConfig.lastPanX = event.clientX;
    this.panConfig.lastPanY = event.clientY;
    this.panConfig.totalPanDistance = 0;
  }

  pan(event: MouseEvent): void {
    if (this.panConfig.isPanning) {
      const deltaX = event.clientX - this.panConfig.lastPanX;
      const deltaY = event.clientY - this.panConfig.lastPanY;

      this.transformMatrix.translateX += deltaX;
      this.transformMatrix.translateY += deltaY;

      this.panConfig.lastPanX = event.clientX;
      this.panConfig.lastPanY = event.clientY;

      this.panConfig.totalPanDistance += Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      requestAnimationFrame(() => this.drawGridLines());
    }
  }

  endPan(): void {
    this.panConfig.isPanning = false;
  }

  zoom(event: WheelEvent): void {
    event.preventDefault();

    // Get the bounding rect of the grid canvas to find its position in the view
    const rect = this.gridCanvas.nativeElement.getBoundingClientRect();

    // Calculate the current position of the mouse in canvas coordinates
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Define a zoom factor, and calculate how much we should zoom from the wheel event
    const zoomFactor = 0.0005;
    const amount = 1 - event.deltaY * zoomFactor;

    // Perform the zoom by calling the scaleAt method with the mouse position and the zoom amount
    this.scaleAt({ x, y }, amount);

    // Request a redraw of the grid using the updated transformation matrix
    requestAnimationFrame(() => this.drawGridLines());
  }

  private scaleAt(point: { x: number; y: number }, amount: number): void {
    // Extract the current scale and translation values from the transformation matrix
    const { scaleX: scale, translateX: posX, translateY: posY } = this.transformMatrix;

    // Calculate the new scale by multiplying the current scale by the zoom amount
    const newScale = scale * amount;

    // Prevent zooming beyond the predefined min and max zoom levels
    if (newScale < GRID_CONSTANTS.MIN_ZOOM_LEVEL || newScale > GRID_CONSTANTS.MAX_ZOOM_LEVEL) {
      return;
    }

    // Set the new scale values in the transformation matrix
    this.transformMatrix.scaleX = this.transformMatrix.scaleY = newScale;

    // Adjust the translation values to keep the zoom centered around the mouse position
    this.transformMatrix.translateX = point.x - (point.x - posX) * amount;
    this.transformMatrix.translateY = point.y - (point.y - posY) * amount;
  }
}

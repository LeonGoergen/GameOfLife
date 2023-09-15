import { Injectable } from '@angular/core';
import { GRID_CONSTANTS } from '../../app.constants';

@Injectable({
  providedIn: 'root',
})
export class TransformationMatrixService {
    private scaleX: number = 1;
    private skewY: number= 0;
    private skewX: number= 0;
    private scaleY: number= 1;
    private translateX: number= 0;
    private translateY: number= 0;

  get matrix() {
    return [
      this.scaleX,
      this.skewY,
      this.skewX,
      this.scaleY,
      this.translateX,
      this.translateY
    ];
  }

  translate(deltaX: number, deltaY: number): void {
    this.translateX += deltaX;
    this.translateY += deltaY;
  }

  scaleAt(point: { x: number; y: number }, amount: number): void {
    const newScale = this.scaleX * amount;

    if (newScale < GRID_CONSTANTS.MIN_ZOOM_LEVEL || newScale > GRID_CONSTANTS.MAX_ZOOM_LEVEL) {
      return;
    }

    this.scaleX = this.scaleY = newScale;

    this.translateX = point.x - (point.x - this.translateX) * amount;
    this.translateY = point.y - (point.y - this.translateY) * amount;
  }
}

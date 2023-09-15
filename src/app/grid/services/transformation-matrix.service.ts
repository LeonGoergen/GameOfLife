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

  get inverseMatrix() {
    const det = this.scaleX * this.scaleY - this.skewX * this.skewY;

    if (det === 0) {
      throw new Error('Non-invertible matrix');
    }

    const invDet = 1 / det;

    const invScaleX = this.scaleY * invDet;
    const invSkewY = -this.skewY * invDet;
    const invSkewX = -this.skewX * invDet;
    const invScaleY = this.scaleX * invDet;

    const invTranslateX = -(invScaleX * this.translateX + invSkewY * this.translateY);
    const invTranslateY = -(invSkewX * this.translateX + invScaleY * this.translateY);

    return [
      invScaleX,
      invSkewY,
      invSkewX,
      invScaleY,
      invTranslateX,
      invTranslateY,
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

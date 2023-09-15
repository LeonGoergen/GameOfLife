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

  private calculateBounds(): { maxTranslateX: number, minTranslateX: number, maxTranslateY: number, minTranslateY: number } {
    const maxTranslateX = 0;
    const minTranslateX = GRID_CONSTANTS.CANVAS_WIDTH - (GRID_CONSTANTS.GRID_SIZE * this.scaleX);

    const maxTranslateY = 0;
    const minTranslateY = GRID_CONSTANTS.CANVAS_HEIGHT - (GRID_CONSTANTS.GRID_SIZE * this.scaleY);

    return { maxTranslateX, minTranslateX, maxTranslateY, minTranslateY };
  }

  translate(deltaX: number, deltaY: number): void {
    const newTranslateX = this.translateX + deltaX;
    const newTranslateY = this.translateY + deltaY;

    const { maxTranslateX, minTranslateX, maxTranslateY, minTranslateY } = this.calculateBounds();

    this.translateX = Math.min(maxTranslateX, Math.max(minTranslateX, newTranslateX));
    this.translateY = Math.min(maxTranslateY, Math.max(minTranslateY, newTranslateY));
  }

  scaleAt(point: { x: number; y: number }, amount: number): void {
    const newScale = this.scaleX * amount;

    if (newScale < GRID_CONSTANTS.MIN_ZOOM_LEVEL || newScale > GRID_CONSTANTS.MAX_ZOOM_LEVEL) {
      return;
    }

    this.scaleX = this.scaleY = newScale;

    this.translateX = point.x - (point.x - this.translateX) * amount;
    this.translateY = point.y - (point.y - this.translateY) * amount;

    const { maxTranslateX, minTranslateX, maxTranslateY, minTranslateY } = this.calculateBounds();

    this.translateX = Math.min(maxTranslateX, Math.max(minTranslateX, this.translateX));
    this.translateY = Math.min(maxTranslateY, Math.max(minTranslateY, this.translateY));
  }

  transformPoint(point: { x: number; y: number }, matrix: number[]): { x: number; y: number } {
    const [a, b, c, d, e, f] = matrix;

    const x = a * point.x + c * point.y + e;
    const y = b * point.x + d * point.y + f;

    return { x, y };
  }
}

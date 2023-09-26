import { Injectable } from '@angular/core';
import { GRID_CONSTANTS } from '../app.constants';

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

  public get matrix() {
    return [
      this.scaleX,
      this.skewY,
      this.skewX,
      this.scaleY,
      this.translateX,
      this.translateY
    ];
  }

  public setTransform(scaleX: number, skewY: number, skewX: number, scaleY: number, translateX: number, translateY: number): void {
    this.scaleX = scaleX;
    this.skewY = skewY;
    this.skewX = skewX;
    this.scaleY = scaleY;
    this.translateX = translateX;
    this.translateY = translateY;
  }

  public get inverseMatrix() {
    const det : number= this.scaleX * this.scaleY - this.skewX * this.skewY;

    if (det === 0) {
      throw new Error('Non-invertible matrix');
    }

    const invDet: number = 1 / det;

    const invScaleX: number = this.scaleY * invDet;
    const invSkewY: number = -this.skewY * invDet;
    const invSkewX: number = -this.skewX * invDet;
    const invScaleY: number = this.scaleX * invDet;

    const invTranslateX: number = -(invScaleX * this.translateX + invSkewY * this.translateY);
    const invTranslateY: number = -(invSkewX * this.translateX + invScaleY * this.translateY);

    return [
      invScaleX,
      invSkewY,
      invSkewX,
      invScaleY,
      invTranslateX,
      invTranslateY,
    ];
  }

  private calculateBounds(maxGridSize: number): { maxTranslateX: number, minTranslateX: number, maxTranslateY: number, minTranslateY: number } {
    const maxTranslateX: number = 0;
    const minTranslateX: number = GRID_CONSTANTS.CANVAS_WIDTH - (maxGridSize * this.scaleX);

    const maxTranslateY: number = 0;
    const minTranslateY: number = GRID_CONSTANTS.CANVAS_HEIGHT - (maxGridSize * this.scaleY);

    return { maxTranslateX, minTranslateX, maxTranslateY, minTranslateY };
  }

  public translate(deltaX: number, deltaY: number, maxGridSize: number): void {
    const newTranslateX: number = this.translateX + deltaX;
    const newTranslateY: number = this.translateY + deltaY;

    const { maxTranslateX, minTranslateX, maxTranslateY, minTranslateY } = this.calculateBounds(maxGridSize);

    this.translateX = Math.min(maxTranslateX, Math.max(minTranslateX, newTranslateX));
    this.translateY = Math.min(maxTranslateY, Math.max(minTranslateY, newTranslateY));
  }

  public scaleAt(point: { x: number; y: number }, amount: number, maxGridSize: number): void {
    const newScale: number = this.scaleX * amount;

    const potentialMinTranslateX: number = GRID_CONSTANTS.CANVAS_WIDTH - (maxGridSize * newScale);
    const potentialMinTranslateY: number = GRID_CONSTANTS.CANVAS_HEIGHT - (maxGridSize * newScale);

    if (potentialMinTranslateX > 0 || potentialMinTranslateY > 0) { return; }
    if (newScale < GRID_CONSTANTS.MIN_ZOOM_LEVEL || newScale > GRID_CONSTANTS.MAX_ZOOM_LEVEL) { return; }

    this.scaleX = this.scaleY = newScale;

    this.translateX = point.x - (point.x - this.translateX) * amount;
    this.translateY = point.y - (point.y - this.translateY) * amount;

    const { maxTranslateX, minTranslateX, maxTranslateY, minTranslateY } = this.calculateBounds(maxGridSize);

    this.translateX = Math.min(maxTranslateX, Math.max(minTranslateX, this.translateX));
    this.translateY = Math.min(maxTranslateY, Math.max(minTranslateY, this.translateY));
  }

  public transformPoint(point: { x: number; y: number }, matrix: number[]): { x: number; y: number } {
    const [a, b, c, d, e, f] = matrix;

    const x: number = a * point.x + c * point.y + e;
    const y: number = b * point.x + d * point.y + f;

    return { x, y };
  }
}

import { Injectable } from '@angular/core';
import {TransformationMatrix} from "../models/transformation-matrix.model";
import {DrawingContext} from "../models/drawing-context.model";
import {MAIN_GRID_CONSTANTS} from "../app.constants";

@Injectable({
  providedIn: 'root',
})
export class TransformationMatrixService {
  public unpack(transformationMatrix: TransformationMatrix): any[] {
    return [
      transformationMatrix.scaleX,
      transformationMatrix.skewY,
      transformationMatrix.skewX,
      transformationMatrix.scaleY,
      transformationMatrix.translateX,
      transformationMatrix.translateY
    ];
  }

  public setTransform(transformationMatrix: TransformationMatrix, scaleX: number, skewY: number, skewX: number, scaleY: number, translateX: number, translateY: number): TransformationMatrix {
    transformationMatrix.scaleX = scaleX;
    transformationMatrix.skewY = skewY;
    transformationMatrix.skewX = skewX;
    transformationMatrix.scaleY = scaleY;
    transformationMatrix.translateX = translateX;
    transformationMatrix.translateY = translateY;

    return transformationMatrix;
  }

  public getInverseMatrix(transformationMatrix: TransformationMatrix): number[] {
    const det : number= transformationMatrix.scaleX * transformationMatrix.scaleY - transformationMatrix.skewX * transformationMatrix.skewY;

    if (det === 0) {
      throw new Error('Non-invertible matrix');
    }

    const invDet: number = 1 / det;

    const invScaleX: number = transformationMatrix.scaleY * invDet;
    const invSkewY: number = -transformationMatrix.skewY * invDet;
    const invSkewX: number = -transformationMatrix.skewX * invDet;
    const invScaleY: number = transformationMatrix.scaleX * invDet;

    const invTranslateX: number = -(invScaleX * transformationMatrix.translateX + invSkewY * transformationMatrix.translateY);
    const invTranslateY: number = -(invSkewX * transformationMatrix.translateX + invScaleY * transformationMatrix.translateY);

    return [
      invScaleX,
      invSkewY,
      invSkewX,
      invScaleY,
      invTranslateX,
      invTranslateY,
    ];
  }

  private calculateBounds(transformationMatrix: TransformationMatrix, drawingContext: DrawingContext, maxGridSize: number): { maxTranslateX: number, minTranslateX: number, maxTranslateY: number, minTranslateY: number } {
    const maxTranslateX: number = 0;
    const minTranslateX: number = drawingContext.CanvasWidth - (maxGridSize * transformationMatrix.scaleX);

    const maxTranslateY: number = 0;
    const minTranslateY: number = drawingContext.CanvasHeight - (maxGridSize * transformationMatrix.scaleY);

    return { maxTranslateX, minTranslateX, maxTranslateY, minTranslateY };
  }

  public translate(transformationMatrix: TransformationMatrix, drawingContext: DrawingContext, deltaX: number, deltaY: number, maxGridSize: number): TransformationMatrix {
    const newTranslateX: number = transformationMatrix.translateX + deltaX;
    const newTranslateY: number = transformationMatrix.translateY + deltaY;

    const { maxTranslateX, minTranslateX, maxTranslateY, minTranslateY } = this.calculateBounds(transformationMatrix, drawingContext, maxGridSize);

    transformationMatrix.translateX = Math.min(maxTranslateX, Math.max(minTranslateX, newTranslateX));
    transformationMatrix.translateY = Math.min(maxTranslateY, Math.max(minTranslateY, newTranslateY));

    return transformationMatrix;
  }

  public scaleAt(transformationMatrix: TransformationMatrix, drawingContext: DrawingContext, point: { x: number; y: number }, amount: number, maxGridSize: number): TransformationMatrix {
    const newScale: number = transformationMatrix.scaleX * amount;

    const potentialMinTranslateX: number = drawingContext.CanvasWidth - (maxGridSize * newScale);
    const potentialMinTranslateY: number = drawingContext.CanvasHeight - (maxGridSize * newScale);

    if (potentialMinTranslateX > 0 || potentialMinTranslateY > 0) { return transformationMatrix; }
    if (newScale < MAIN_GRID_CONSTANTS.MIN_ZOOM_LEVEL || newScale > MAIN_GRID_CONSTANTS.MAX_ZOOM_LEVEL) { return transformationMatrix; }

    transformationMatrix.scaleX = transformationMatrix.scaleY = newScale;

    transformationMatrix.translateX = point.x - (point.x - transformationMatrix.translateX) * amount;
    transformationMatrix.translateY = point.y - (point.y - transformationMatrix.translateY) * amount;

    const { maxTranslateX, minTranslateX, maxTranslateY, minTranslateY } = this.calculateBounds(transformationMatrix, drawingContext, maxGridSize);

    transformationMatrix.translateX = Math.min(maxTranslateX, Math.max(minTranslateX, transformationMatrix.translateX));
    transformationMatrix.translateY = Math.min(maxTranslateY, Math.max(minTranslateY, transformationMatrix.translateY));

    return transformationMatrix;
  }

  public transformPoint(point: { x: number; y: number }, matrix: number[]): { x: number; y: number } {
    const [a, b, c, d, e, f] = matrix;

    const x: number = a * point.x + c * point.y + e;
    const y: number = b * point.x + d * point.y + f;

    return { x, y };
  }
}

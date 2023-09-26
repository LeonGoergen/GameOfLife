import {ElementRef, Injectable} from '@angular/core';
import {GRID_CONSTANTS} from "../../app.constants";
import {DrawingContext} from "../drawing-context.model";

@Injectable({
  providedIn: 'root'
})
export class DrawingContextFactoryService {
  create(gridCanvas: ElementRef<HTMLCanvasElement>, gameCanvas: ElementRef<HTMLCanvasElement>): DrawingContext {
    const offscreenCanvas: HTMLCanvasElement = document.createElement('canvas');
    offscreenCanvas.width = GRID_CONSTANTS.CANVAS_WIDTH;
    offscreenCanvas.height = GRID_CONSTANTS.CANVAS_HEIGHT;
    return {
      gridCtx: gridCanvas.nativeElement.getContext('2d')!,
      gameCtx: gameCanvas.nativeElement.getContext('2d')!,
      offscreenCanvas: offscreenCanvas,
      offscreenCtx: offscreenCanvas.getContext('2d')!,
      CanvasWidth: GRID_CONSTANTS.CANVAS_WIDTH,
      CanvasHeight: GRID_CONSTANTS.CANVAS_HEIGHT
    };
  }
}

import {ElementRef, Injectable} from '@angular/core';
import {DrawingContext} from "../drawing-context.model";

@Injectable({
  providedIn: 'root'
})
export class DrawingContextFactoryService {
  create(gridCanvas: ElementRef<HTMLCanvasElement>,
         gameCanvas: ElementRef<HTMLCanvasElement>,
         width: number, height: number): DrawingContext {
    const offscreenCanvas: HTMLCanvasElement = document.createElement('canvas');
    offscreenCanvas.width = width;
    offscreenCanvas.height = height;
    return {
      gridCtx: gridCanvas.nativeElement.getContext('2d')!,
      gameCtx: gameCanvas.nativeElement.getContext('2d')!,
      offscreenCanvas: offscreenCanvas,
      offscreenCtx: offscreenCanvas.getContext('2d')!,
      CanvasWidth: width,
      CanvasHeight: height
    };
  }
}

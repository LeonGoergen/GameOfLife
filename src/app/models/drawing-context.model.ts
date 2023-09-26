export interface DrawingContext {
  gridCtx: CanvasRenderingContext2D;
  gameCtx: CanvasRenderingContext2D;
  offscreenCanvas: HTMLCanvasElement;
  offscreenCtx: CanvasRenderingContext2D;
  CanvasWidth: number;
  CanvasHeight: number;
}

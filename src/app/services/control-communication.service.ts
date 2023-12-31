import { Injectable } from '@angular/core';
import {Observable, Subject} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class ControlCommunicationService {
  private gameInterval: any;
  private generationInterval: number = 1000;
  private checkpointGenerationCount: number = 0;
  private targetFPS: number = 30;
  private fps: number = 0;

  private nextGenerationSubject: Subject<boolean> = new Subject<boolean>();
  private lastGenerationSubject: Subject<void> = new Subject<void>();
  private resetSubject: Subject<void> = new Subject<void>();
  private gridSizeSubject: Subject<number> = new Subject<number>();
  private toroidalGridSubject: Subject<boolean> = new Subject<boolean>();
  private GridLinesSubject: Subject<boolean> = new Subject<boolean>();
  private saveCheckpointSubject: Subject<void> = new Subject<void>();
  private checkpointGenerationSubject: Subject<number> = new Subject<number>();
  private returnToCheckpointSubject: Subject<void> = new Subject<void>();
  private fpsSubject: Subject<number> = new Subject<number>();

  public nextGeneration$: Observable<boolean> = this.nextGenerationSubject.asObservable();
  public lastGeneration$: Observable<void> = this.lastGenerationSubject.asObservable();
  public reset$: Observable<void> = this.resetSubject.asObservable();
  public gridSize$: Observable<number> = this.gridSizeSubject.asObservable();
  public toroidalGrid$: Observable<boolean> = this.toroidalGridSubject.asObservable();
  public gridLines$: Observable<boolean> = this.GridLinesSubject.asObservable();
  public saveCheckpoint$: Observable<void> = this.saveCheckpointSubject.asObservable();
  public checkpointGeneration$: Observable<number> = this.checkpointGenerationSubject.asObservable();
  public returnToCheckpoint$: Observable<void> = this.returnToCheckpointSubject.asObservable();
  public fps$: Observable<number> = this.fpsSubject.asObservable();

  public startAutoGeneration(interval: number): void {
    this.stopAutoGeneration();
    this.generationInterval = interval;

    let generationCounter = 0;

    this.gameInterval = setInterval(() => {
      const skipRate = Math.ceil(this.fps / this.targetFPS);
      generationCounter++;
      if (generationCounter % skipRate === 0) {
        this.nextGeneration(true);
      } else {
        this.nextGeneration(false);
      }
    }, this.generationInterval);
  }

  public updateGenerationInterval(interval: number): void {
    this.generationInterval = interval;
    if (this.gameInterval) { this.startAutoGeneration(interval); }
  }

  public stopAutoGeneration(): void {
    if (this.gameInterval) {
      clearInterval(this.gameInterval);
      this.gameInterval = null;
    }
  }

  public nextGeneration(drawing: boolean): void {
    this.nextGenerationSubject.next(drawing);
  }

  public undoLastGeneration(): void {
    this.lastGenerationSubject.next();
  }

  public resetGrid(): void {
    this.resetSubject.next();
  }

  public updateGridSize(size: number): void {
    this.gridSizeSubject.next(size);
  }

  public updateToroidalGrid(value: boolean): void {
    this.toroidalGridSubject.next(value);
  }

  public updateGridLines(value: boolean): void {
    this.GridLinesSubject.next(value);
  }

  public saveCheckpoint(): void {
    this.saveCheckpointSubject.next();
  }

  public setCheckpointGeneration(generation: number): void {
    this.checkpointGenerationCount = generation;
    this.checkpointGenerationSubject.next(generation);
  }

  public getCheckpointGeneration(): number {
    return this.checkpointGenerationCount;
  }

  public returnToCheckpoint(): void {
    this.returnToCheckpointSubject.next();
  }

  public updateFps(fps: number): void {
    this.fps = fps;
    this.fpsSubject.next(fps);
  }
}

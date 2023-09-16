import { Injectable } from '@angular/core';
import {Subject} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class GameService {
  private gameInterval: any;

  private nextGenerationSubject = new Subject<void>();
  private lastGenerationSubject = new Subject<void>();
  private resetSubject = new Subject<void>();

  nextGeneration$ = this.nextGenerationSubject.asObservable();
  lastGeneration$ = this.lastGenerationSubject.asObservable();
  reset$ = this.resetSubject.asObservable();

  constructor() {}

  startAutoGeneration(interval: number): void {
    this.stopAutoGeneration();
    this.gameInterval = setInterval(() => {
      this.nextGeneration();
    }, interval);
  }

  stopAutoGeneration(): void {
    if (this.gameInterval) {
      clearInterval(this.gameInterval);
      this.gameInterval = null;
    }
  }

  nextGeneration(): void {
    this.nextGenerationSubject.next();
  }

  undoLastGeneration(): void {
    this.lastGenerationSubject.next();
  }

  resetGrid(): void {
    this.resetSubject.next();
  }
}

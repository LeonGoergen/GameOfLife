import { Injectable } from '@angular/core';
import {Cell} from "../grid/cell/cell";
import {Subject} from "rxjs";
import {GRID_CONSTANTS} from "../app.constants";

@Injectable({
  providedIn: 'root'
})
export class RleService {
  private x!: number;
  private y!: number;
  private step!: number;
  private cells!: Cell[];
  private isIgnoring!: boolean;

  public rleLoaded$: Subject<Cell[]> = new Subject<Cell[]>();

  public decodeRLE(rleString: string, startX: number, startY: number): void {
    if (/[^bo$0-9!#x]/.test(rleString)) {
      console.error('Invalid characters in input string.');
      return;
    }

    this.initVariables();

    for (let i: number = 0; i < rleString.length; i++) {
      if (this.isIgnoring) {
        if (rleString[i] === "\n") { this.isIgnoring = false; }
        continue;
      }

      switch (rleString[i]) {
        case "#":
        case "x":
        case "!":
          this.isIgnoring = true;
          continue;
        case "o":
          this.updateCoordinatesForO(startX, startY);
          continue;
        case "b":
          this.updateCoordinatesForB();
          continue;
        case "$":
          this.updateCoordinatesForDollar();
          continue;
        default:
          i = this.updateStep(i, rleString);
      }
    }

    this.rleLoaded$.next(this.cells);
  }

  private resetStep = (): void => {
    this.step = 1;
  };

  private updateCoordinatesForO(startX: number, startY: number): void {
    for (let j: number = 0; j < this.step; j++) {
      this.cells.push(
        new Cell(
          startX + this.x * GRID_CONSTANTS.CELL_SIZE,
          startY + this.y * GRID_CONSTANTS.CELL_SIZE,
          true
        )
      );
      this.x++;
    }
    this.resetStep();
  };

  private updateCoordinatesForB(): void {
    this.x += this.step;
    this.resetStep();
  };

  private updateCoordinatesForDollar(): void {
    this.x = 0;
    this.y += this.step;
    this.resetStep();
  };

  private updateStep(i: number, rleString: string): number {
    const regex: RegExp = /^\d+/;
    const match: RegExpExecArray | null = regex.exec(rleString.slice(i));
    if (match) {
      this.step = parseInt(match[0]);
      i += match[0].length - 1;
    }
    return i;
  };

  private initVariables(): void {
    this.x = 0;
    this.y = 0;
    this.step = 1;
    this.cells = [];
    this.isIgnoring = false;
  }
}

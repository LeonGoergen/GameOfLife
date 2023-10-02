import { Injectable } from '@angular/core';
import {Cell} from "../grid/cell/cell";
import {GridProperties} from "../models/grid-properties.model";

@Injectable({
  providedIn: 'root'
})
export class RleService {
  public decodeRLE(gridProperties: GridProperties,
                   rleString: string,
                   startX: number,
                   startY: number): Cell[] | null {
    if (/[^bo$0-9!#x]/.test(rleString)) {
      console.error('Invalid characters in input string.');
      return null;
    }

    const cells: Cell[] = [];
    let x: number = 0;
    let y: number = 0;
    let step: number = 1;
    let isIgnoring: boolean = false;

    const resetStep = (): void => {
      step = 1;
    };

    const updateCoordinatesForO = (): void => {
      for (let j: number = 0; j < step; j++) {
        cells.push(
          new Cell(
            startX + x * gridProperties.cellSize,
            startY + y * gridProperties.cellSize,
            true,
            gridProperties.cellSize
          )
        );
        x++;
      }
      resetStep();
    };

    const updateCoordinatesForB = (): void => {
      x += step;
      resetStep();
    };

    const updateCoordinatesForDollar = (): void => {
      x = 0;
      y += step;
      resetStep();
    };

    const updateStep = (i: number, rleString: string): number => {
      const regex: RegExp = /^\d+/;
      const match: RegExpExecArray | null = regex.exec(rleString.slice(i));
      if (match) {
        step = parseInt(match[0]);
        i += match[0].length - 1;
      }
      return i;
    };

    for (let i: number = 0; i < rleString.length; i++) {
      if (isIgnoring) {
        if (rleString[i] === "\n") {
          isIgnoring = false;
        }
        continue;
      }

      switch (rleString[i]) {
        case "#":
        case "x":
        case "!":
          isIgnoring = true;
          continue;
        case "o":
          updateCoordinatesForO();
          continue;
        case "b":
          updateCoordinatesForB();
          continue;
        case "$":
          updateCoordinatesForDollar();
          continue;
        default:
          i = updateStep(i, rleString);
      }
    }

    return cells;
  }
}

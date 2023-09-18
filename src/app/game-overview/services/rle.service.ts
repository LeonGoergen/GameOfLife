import { Injectable } from '@angular/core';
import {Cell} from "../grid/cell/cell.model";
import {Subject} from "rxjs";
import {GRID_CONSTANTS} from "../../app.constants";

@Injectable({
  providedIn: 'root'
})
export class RleService {

  public rleLoaded$ = new Subject<Cell[]>();

  decodeRLE(rleString: string, startX: number, startY: number): void {
    if (/[^bo$0-9!]/.test(rleString)) {
      console.error('Invalid characters in input string.');
      return;
    }

    const lines = rleString.slice(0, -1).split('$');
    const cells: Cell[] = [];

    lines.forEach((line, y) => {
      const expandedLine = this.expandLine(line);

      for (let x = 0; x < expandedLine.length; x++) {
        cells.push(
          new Cell(
            startX + x * GRID_CONSTANTS.CELL_SIZE,
            startY + y * GRID_CONSTANTS.CELL_SIZE,
            expandedLine[x] === 'o'
          )
        );
      }
    });

    this.rleLoaded$.next(cells);
  }

  private expandLine(line: string): string {
    let expandedLine = '';
    let i = 0;

    while (i < line.length) {
      let repeatCount = '';
      while (i < line.length && !isNaN(Number(line[i]))) {
        repeatCount += line[i];
        i++;
      }
      if (repeatCount && i < line.length) {
        expandedLine += line[i].repeat(Number(repeatCount));
      } else if (i < line.length) {
        expandedLine += line[i];
      }
      i++;
    }

    return expandedLine;
  }

}

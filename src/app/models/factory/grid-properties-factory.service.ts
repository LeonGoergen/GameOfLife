import { Injectable } from '@angular/core';
import {GridProperties} from "../grid-properties.model";

@Injectable({
  providedIn: 'root'
})
export class GridPropertiesFactoryService {
  create(gridSize: number, cellSize: number): GridProperties {
    return {
      gridSize: gridSize,
      userGridSize: gridSize,
      cellSize: cellSize,
      gridLines: true,
      isToroidal: true,
      visibleGridRange: {startCol: 0, endCol: 0, startRow: 0, endRow: 0},
      totalPanDistance: 0
    };
  }
}

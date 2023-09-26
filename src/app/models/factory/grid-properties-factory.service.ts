import { Injectable } from '@angular/core';
import {GridProperties} from "../grid-properties.model";
import {GRID_CONSTANTS} from "../../app.constants";

@Injectable({
  providedIn: 'root'
})
export class GridPropertiesFactoryService {
  create(): GridProperties {
    return {
      gridSize: GRID_CONSTANTS.INIT_GRID_SIZE,
      userGridSize: GRID_CONSTANTS.INIT_GRID_SIZE,
      gridLines: true,
      isToroidal: true,
      visibleGridRange: {startCol: 0, endCol: 0, startRow: 0, endRow: 0},
      totalPanDistance: 0
    };
  }
}

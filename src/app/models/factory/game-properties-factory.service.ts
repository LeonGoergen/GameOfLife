import { Injectable } from '@angular/core';
import {GameProperties} from "../game-properties.model";
import {Cell} from "../../grid/cell/cell";

@Injectable({
  providedIn: 'root'
})
export class GamePropertiesFactoryService {
  create(): GameProperties {
    return {
      generationDeltas: [],
      generationCount: 0,
      checkpoint: new Set<string>(),
      cellsToCheck: new Set<string>(),
      cells: new Map<string, Cell>(),
      frameCount: 0
    };
  }
}

import {Cell} from "../grid/cell/cell";

export interface GameProperties {
  generationDeltas: Array<Map<string, boolean>>;
  aliveCells: Map<string, boolean>;
  generationCount: number;
  checkpoint: Set<string>;
  cellsToCheck: Set<string>;
  cells: Map<string, Cell>;
  frameCount: number;
}

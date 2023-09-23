export const GRID_CONSTANTS = {
  CANVAS_WIDTH: window.outerWidth,
  CANVAS_HEIGHT: window.outerHeight,
  INIT_GRID_SIZE: 12_000,
  MAX_GRID_SIZE: 120_000,
  MIN_GRID_SIZE: 2_000,
  CELL_SIZE: 40,
  MIN_ZOOM_LEVEL: 0.1,
  MAX_ZOOM_LEVEL: 2.0,
  ZOOM_FACTOR: 0.005,
  ZOOM_LEVEL_THRESHOLD: 0.9,
  PAN_DISTANCE_THRESHOLD: 5,
};

export const GRID_COLORS = {
  GRID_LINE: 'lightgray',
  DEAD: '#3b3b3b',
  ALIVE: 'whitesmoke',
};

export const CONTROLS_CONSTANTS  = {
  MAX_GEN_PER_SECOND: 500.0,
  MIN_GEN_PER_SECOND: 1,
}

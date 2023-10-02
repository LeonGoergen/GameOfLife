export const MAIN_GRID_CONSTANTS = {
  CANVAS_WIDTH: window.outerWidth,
  CANVAS_HEIGHT: window.outerHeight,
  INIT_GRID_SIZE: 20_000,
  MAX_GRID_SIZE: 120_000,
  MIN_GRID_SIZE: 2_000,
  CELL_SIZE: 40,
  MIN_ZOOM_LEVEL: 0.1,
  MAX_ZOOM_LEVEL: 1.5,
  ZOOM_FACTOR: 0.0005,
  ZOOM_LEVEL_THRESHOLD: 0.9,
  PAN_DISTANCE_THRESHOLD: 5,
};

export const MINI_GRID_CONSTANTS = {
  CANVAS_WIDTH: window.outerWidth,
  CANVAS_HEIGHT: window.outerHeight,
  INIT_GRID_SIZE: 400,
  CELL_SIZE: 20,
};

export const GRID_COLORS = {
  GRID_LINE: 'lightgray',
  DEAD: '#3b3b3b',
  ALIVE: 'whitesmoke',
};

export const CONTROLS_CONSTANTS  = {
  MAX_GEN_PER_SECOND: 300.0,
  MIN_GEN_PER_SECOND: 1,
}

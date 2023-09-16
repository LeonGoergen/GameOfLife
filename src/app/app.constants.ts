export const GRID_CONSTANTS = {
  CANVAS_WIDTH: window.outerWidth,
  CANVAS_HEIGHT: window.outerHeight,
  GRID_SIZE: 60_000,
  CELL_SIZE: 40,
  MIN_ZOOM_LEVEL: 0.1,
  MAX_ZOOM_LEVEL: 2.0,
  ZOOM_FACTOR: 0.0005,
  ZOOM_LEVEL_THRESHOLD: 0.9,
  PAN_DISTANCE_THRESHOLD: 5,
};

export const GRID_COLORS = {
  GRID_LINE: 'lightgray',
  DEAD: '#3b3b3b',
  ALIVE: 'whitesmoke',
}

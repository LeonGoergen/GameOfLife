export const localCategories = [
  {
    title: 'Static Patterns',
    description: 'These are formations that remain stationary, retaining their structure over successive generations without undergoing any change. They represent a stable state in the simulation.',
    patterns: [
      { title: 'Block', description: 'A 2x2 static square that remains stable indefinitely.', rle: '2o$2o!' },
      { title: 'Beehive', description: 'A 6-cell pattern that resembles a beehive and remains stable.', rle: 'b2ob$o2bo$b2o!' },
      { title: 'Loaf', description: 'A 7-cell structure that resembles a loaf of bread; it is stable and does not evolve.', rle: 'b2ob$o2bo$bobo$2bo!' },
      { title: 'Boat', description: 'A 5-cell structure resembling a boat, remaining stable over generations.', rle: '2ob$obo$bo!' },
      { title: 'Tub', description: 'A small 4-cell structure that is stable.', rle: 'bob$obo$bo!' },
      { title: 'Pond', description: 'A stable 8-cell structure resembling a pond.', rle: 'b2ob$o2bo$o2bo$b2o!' },
      { title: 'Ship', description: 'A 6-cell stable formation that resembles a ship.', rle: '2ob$obo$b2o!' },
      { title: 'Canoe', description: 'A static structure that somewhat resembles a canoe, stable through generations.', rle: '3b2o$4bo$3bob$obo2b$2o!' },
      { title: 'Snake', description: 'A 6-cell structure resembling a snake, stable and unchanging.', rle: '2obo$ob2o!' },
    ]
  },
  {
    title: 'Oscillating Patterns',
    description: 'Oscillating patterns are characterized by a repetitive cycle of transformations, wherein they fluctuate between two or more states in a regular pattern. These oscillations create a dynamic yet predictable series of formations as time progresses.',
    patterns: [
      { title: 'Blinker', description: 'A row of three cells that oscillates between a vertical and horizontal orientation every generation.', rle: '3o!' },
      { title: 'Toad', description: 'A 6-cell oscillator that alternates between two phases every generation.', rle: 'b3o$3o!' },
      { title: 'Beacon', description: 'A 6-cell structure that oscillates between two configurations every two generations.', rle: '2o2b$o3b$3bo$2b2o!' },
      { title: 'Pulsar', description: 'A large 48-cell oscillator with a period of 3, showcasing a pulsating behavior.', rle: '2b3o3b3o2b2$o4bobo4bo$o4bobo4bo$o4bobo4bo$2b3o3b3o2b2$2b3o3b3o2b$o4bobo4bo$o4bobo4bo$o4bobo4bo2$2b3o3b3o!' },
      { title: 'Pentadecathlon', description: 'A long oscillator with a period of 15, evolved from a row of 10 cells.', rle: '2bo4bo2b$2ob4ob2o$2bo4bo!' },
      { title: 'Clock', description: 'A small oscillator resembling a clock, oscillating between two phases with a period of 2.', rle: '2bob$obob$bobo$bo!' },
      { title: 'Pinwheel', description: 'A moderately complex oscillator with a period of 4, exhibiting a pinwheel-like motion.', rle: '6b2o4b$6b2o4b2$4b4o4b$2obo4bo3b$2obo2bobo3b$3bo3b2ob2o$3bobo2bob2o$4b4o4b2$4b2o6b$4b2o!' },
      { title: 'Cross', description: 'A large cross-shaped oscillator with a period of 3.', rle: '2b4o2b$2bo2bo2b$3o2b3o$o6bo$o6bo$3o2b3o$2bo2bo2b$2b4o!' },
      { title: 'Traffic Light', description: 'A pattern consisting of multiple blinkers that oscillate in sync, resembling traffic lights.', rle: '2b3o2b2$o5bo$o5bo$o5bo2$2b3o!' },
    ]
  },
  {
    title: 'Moving Patterns',
    description: 'Also known as "spaceships," these patterns exhibit locomotion across the grid, altering their position over sequential generations. They traverse the environment, potentially interacting with other entities on the grid.',
    patterns: [
      { title: 'Glider', description: 'A small 5-cell spaceship that moves diagonally across the grid, with a period of 4.', rle: 'bob$2bo$3o!' },
      { title: 'LWSS', description: 'Lightweight Spaceship (LWSS) is a small spaceship that moves horizontally or vertically every four generations.', rle: 'bo2bo$o4b$o3bo$4o!' },
      { title: 'MWSS', description: 'Middleweight Spaceship (MWSS) is similar to LWSS but larger, moving every four generations.', rle: '3bo2b$bo3bo$o5b$o4bo$5o!' },
      { title: 'HWSS', description: 'Heavyweight Spaceship (HWSS) is larger than MWSS, moving every four generations.', rle: '3b2o2b$bo4bo$o6b$o5bo$6o!' },
      { title: 'Loafer', description: 'A spaceship that drifts slowly across the grid, with a unique loaf-shaped hind end.', rle: 'b2o2bob2o$o2bo2b2o$bobo$2bo$8bo$6b3o$5bo$6bo$7b2o!' },
      { title: 'Copperhead', description: 'A compact spaceship that moves forward two steps every 10 generations.', rle: 'b2o2b2o$3b2o$3b2o$obo2bobo$o6bo2$o6bo$b2o2b2o$2b4o2$3b2o$3b2o!' },
      { title: 'Lobster', description: '', rle: '12b3o$12bo$13bo2b2o$16b2o$12b2o$13b2o$12bo2bo2$14bo2bo$14bo3bo$15b3obo$20bo$2o2bobo13bo$obob2o13bo$o4bo2b2o13b2o$6bo3bo6b2o2b2o2bo$2b2o6bo6bo2bo$2b2o4bobo4b2o$9bo5bo3bo3bo$10bo2bo4b2o$11b2o3bo5bobo$15bo8b2o$15bo4bo$14bo3bo$14bo5b2o$15bo5bo!' },
      { title: 'Weekender', description: 'A large spaceship with a period of 2, moving two steps forward every two generations.', rle: 'bo12bob$bo12bob$obo10bobo$bo12bob$bo12bob$2bo3b4o3bo2b$6b4o6b$2b4o4b4o2b2$4bo6bo4b$5b2o2b2o!' },
      { title: 'Dragon', description: 'A spaceship with an elaborate structure, known for its dragon-like appearance as it moves across the grid.', rle: '12bo16b$12b2o14bo$10bob2o5bobo4b2ob$5bo3bo3b3o2bo4bo5b$2o3bo2bo6bobo5b3o2bo$2o3bob2o6bo3bobobo5b$2o3bo10bobo7b2ob$5b2o14bo6bo$7bo12bobo6b$7bo12bobo6b$5b2o14bo6bo$2o3bo10bobo7b2ob$2o3bob2o6bo3bobobo5b$2o3bo2bo6bobo5b3o2bo$5bo3bo3b3o2bo4bo5b$10bob2o5bobo4b2ob$12b2o14bo$12bo!' },
    ]
  },
  {
    title: 'Generative Patterns',
    description: 'In addition to the above categories, there are generative patterns that spawn other formations, leading to rich and complex evolving dynamics. They may give birth to a range of other patterns, encompassing static, oscillating, or moving types, thereby introducing new elements into the simulation.',
    patterns: [
      { title: 'Gosper Glider Gun', description: 'A pattern that generates a stream of gliders, effectively acting as a glider "gun".', rle: '24bo11b$22bobo11b$12b2o6b2o12b2o$11bo3bo4b2o12b2o$2o8bo5bo3b2o14b$2o8bo3bob2o4bobo11b$10bo5bo7bo11b$11bo3bo20b$12b2o!' },
      { title: 'Simkin Glider Gun', description: 'A smaller glider gun that also produces a stream of gliders at a regular interval.', rle: '2o5b2o$2o5b2o2$4b2o$4b2o5$22b2ob2o$21bo5bo$21bo6bo2b2o$21b3o3bo3b2o$26bo4$20b2o$20bo$21b3o$23bo!' },
      { title: 'R-pentomino', description: 'A simple Pattern generating a chaotic offspring, lasting for 1105 generations.', rle: 'b2o$2ob$bo!' },
      { title: 'Blinker Fuse', description: 'A pattern where blinkers act as a fuse, setting off a chain reaction of transformations.', rle: '2o2bob2o17b$5obobo16b$8bob3ob3ob3ob3o$5obobo16b$2o2bob2o!' },
      { title: 'Block-laying Switch Engine', description: 'A moving pattern that lays down a trail of blocks as it moves across the grid.', rle: '18bo10b$b3o8bo5bo10b$o3bo6bo7bo9b$b2o9b4o2b2o9b$3b2ob2o9b3o9b$5b2o11bobo8b$19bo7b2o$19bo7b2o11$7b2o20b$7b2o20b7$15b2o12b$15b2o!' },
      { title: 'Time bomb', description: 'A pattern that produces gliders while moving across the grid, creating a stream of glider patterns.', rle: 'bo11b2o$obo4bo6bo$7bo4bo2b$2bo2bo3bo2bo2b$2b2o6bo4b$3bo!' },
      { title: 'Die Hard', description: 'A pattern that disappears after 130 generations, going through a series of transformations before vanishing.', rle: '6bob$2o6b$bo3b3o!' },
      { title: 'Acorn', description: 'A small pattern that evolves into a complex system with many oscillators, static patterns, and spaceships.', rle: 'bo5b$3bo3b$2o2b3o!' },
      { title: 'Bunnies', description: '', rle: 'o5bob$2bo3bob$2bo2bobo$bobo!' },
    ]
  },
];

export const categories = [
  {
    title: 'Static Patterns',
    description: 'These are formations that remain stationary, retaining their structure over successive generations without undergoing any change. They represent a stable state in the simulation.',
    patterns: [
      { title: 'Block', img: 'assets/patterns/block.png', description: 'A 2x2 static square that remains stable indefinitely.' },
      { title: 'Beehive', img: 'assets/patterns/beehive.png', description: 'A 6-cell pattern that resembles a beehive and remains stable.' },
      { title: 'Loaf', img: 'assets/patterns/loaf.png', description: 'A 7-cell structure that resembles a loaf of bread; it is stable and does not evolve.' },
      { title: 'Boat', img: 'assets/patterns/boat.png', description: 'A 5-cell structure resembling a boat, remaining stable over generations.' },
      { title: 'Tub', img: 'assets/patterns/tub.png', description: 'A small 4-cell structure that is stable.' },
      { title: 'Pond', img: 'assets/patterns/pond.png', description: 'A stable 8-cell structure resembling a pond.' },
      { title: 'Ship', img: 'assets/patterns/ship.png', description: 'A 6-cell stable formation that resembles a ship.' },
      { title: 'Canoe', img: 'assets/patterns/canoe.png', description: 'A static structure that somewhat resembles a canoe, stable through generations.' },
      { title: 'Snake', img: 'assets/patterns/snake.png', description: 'A 6-cell structure resembling a snake, stable and unchanging.' },
    ]
  },
  {
    title: 'Oscillating Patterns',
    description: 'Oscillating patterns are characterized by a repetitive cycle of transformations, wherein they fluctuate between two or more states in a regular pattern. These oscillations create a dynamic yet predictable series of formations as time progresses.',
    patterns: [
      { title: 'Blinker', img: 'assets/rep.gif', description: 'A row of three cells that oscillates between a vertical and horizontal orientation every generation.' },
      { title: 'Toad', img: 'assets/patterns/toad.png', description: 'A 6-cell oscillator that alternates between two phases every generation.' },
      { title: 'Beacon', img: 'assets/patterns/beacon.png', description: 'A 6-cell structure that oscillates between two configurations every two generations.' },
      { title: 'Pulsar', img: 'assets/patterns/pulsar.png', description: 'A large 48-cell oscillator with a period of 3, showcasing a pulsating behavior.' },
      { title: 'Pentadecathlon', img: 'assets/patterns/pentadecathlon.png', description: 'A long oscillator with a period of 15, evolved from a row of 10 cells.' },
      { title: 'Clock', img: 'assets/patterns/clock.png', description: 'A small oscillator resembling a clock, oscillating between two phases with a period of 2.' },
      { title: 'Pinwheel', img: 'assets/patterns/pinwheel.png', description: 'A moderately complex oscillator with a period of 4, exhibiting a pinwheel-like motion.' },
      { title: 'Cross', img: 'assets/patterns/cross.png', description: 'A large cross-shaped oscillator with a period of 3.' },
      { title: 'Traffic Light', img: 'assets/patterns/traffic_light.png', description: 'A pattern consisting of multiple blinkers that oscillate in sync, resembling traffic lights.' },
    ]
  },
  {
    title: 'Moving Patterns',
    description: 'Also known as "spaceships," these patterns exhibit locomotion across the grid, altering their position over sequential generations. They traverse the environment, potentially interacting with other entities on the grid.',
    patterns: [
      { title: 'Glider', img: 'assets/patterns/glider.png', description: 'A small 5-cell spaceship that moves diagonally across the grid, with a period of 4.' },
      { title: 'LWSS', img: 'assets/patterns/lwss.png', description: 'Lightweight Spaceship (LWSS) is a small spaceship that moves horizontally or vertically every four generations.' },
      { title: 'MWSS', img: 'assets/patterns/mwss.png', description: 'Middleweight Spaceship (MWSS) is similar to LWSS but larger, moving every four generations.' },
      { title: 'HWSS', img: 'assets/patterns/hwss.png', description: 'Heavyweight Spaceship (HWSS) is larger than MWSS, moving every four generations.' },
      { title: 'Loafer', img: 'assets/patterns/loafer.png', description: 'A spaceship that drifts slowly across the grid, with a unique loaf-shaped hind end.' },
      { title: 'Copperhead', img: 'assets/patterns/copperhead.png', description: 'A compact spaceship that moves forward two steps every 10 generations.' },
      { title: 'Gemini', img: 'assets/patterns/gemini.png', description: 'A complex spaceship constructed from two smaller interacting spaceships, demonstrating intricate and harmonious locomotion.' },
      { title: 'Weekender', img: 'assets/patterns/weekender.png', description: 'A large spaceship with a period of 2, moving two steps forward every two generations.' },
      { title: 'Dragon', img: 'assets/patterns/dragon.png', description: 'A spaceship with an elaborate structure, known for its dragon-like appearance as it moves across the grid.' },
    ]
  },
  {
    title: 'Generative Patterns',
    description: 'In addition to the above categories, there are generative patterns that spawn other formations, leading to rich and complex evolving dynamics. They may give birth to a range of other patterns, encompassing static, oscillating, or moving types, thereby introducing new elements into the simulation.',
    patterns: [
      { title: 'Gosper Glider Gun', img: 'assets/patterns/gosper_glider_gun.png', description: 'A pattern that generates a stream of gliders, effectively acting as a glider "gun".' },
      { title: 'Simkin Glider Gun', img: 'assets/patterns/simkin_glider_gun.png', description: 'A smaller glider gun that also produces a stream of gliders at a regular interval.' },
      { title: 'R-pentomino', img: 'assets/patterns/pentadecathlon_on_r_pentomino.png', description: 'A simple Pattern generating a chaotic offspring, lasting for 1105 generations.' },
      { title: 'Blinker Fuse', img: 'assets/patterns/blinker_fuse.png', description: 'A pattern where blinkers act as a fuse, setting off a chain reaction of transformations.' },
      { title: 'Block-laying Switch Engine', img: 'assets/patterns/block_laying_switch_engine.png', description: 'A moving pattern that lays down a trail of blocks as it moves across the grid.' },
      { title: 'Glider-producing Switch Engine', img: 'assets/patterns/glider_producing_switch_engine.png', description: 'A pattern that produces gliders while moving across the grid, creating a stream of glider patterns.' },
      { title: 'Die Hard', img: 'assets/patterns/die_hard.png', description: 'A pattern that disappears after 130 generations, going through a series of transformations before vanishing.' },
      { title: 'Acorn', img: 'assets/patterns/acorn.png', description: 'A small pattern that evolves into a complex system with many oscillators, static patterns, and spaceships.' },
      { title: 'Lobster', img: 'assets/patterns/lobster.png', description: 'A complex generative pattern known for its lobster-like appearance, creating a rich variety of offspring patterns over generations.' },
    ]
  },
];

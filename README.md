# Ant Simulation

This is an Ant simulation using P5.js

The Ants start from their colony and start searching for food. When they find it they take it back to the colony.

## Demo

A demo is available at: [https://lucaangioloni.github.io/ant_simulation/](https://lucaangioloni.github.io/ant_simulation/)

![ant_gif](imgs/ant_gif.gif)

## Code structure

The code is subdivided into 3 main js files located in the folder `js`:

- `main.js`: where the P5.js functions are located and where the main logic is written

- `ant.js`: where the `Ant` class is declared.

- `food.js`: where the Food generators are implemented.

To change the hyperparameters go to `js/main.js` and change them.

```javascript
// Set maximum frame rate
const fr = 30;

// Throttle the keyboard commands
const throttle_frames = 5;
let throttole = 0;

// Init total food eaten to 0
let tot_food = 0;

// Init Parameters and Variables ------------------------------------
const background_color = "#D4B59D";

const food_rate = 60;
const food_refill = 2;
const food_locations = 3;
const food_quantity = 20;
const food_radius = 10;
const food_color = "#D5EFD5";
const food_stroke = "#D5EFD5";

const ant_number = 100;
const ant_radius = 8;
const ant_color = "#572D15";
const ant_stroke = "#572D15";
const ant_food_color = "#B64D3A";
const ant_speed = 4;

let do_pheromones = false;
let do_pheromone_draw = false;

let momentum; // memory
let randomness;
let home_coeff;
let food_coeff;

function set_normal_coeff() {
  momentum = 0.65;
  randomness = 0.15;
  home_coeff = 0.2;
  food_coeff = 0.2;
}

function set_pheromones_coeff() {
  momentum = 0.2;
  randomness = 0.2;
  home_coeff = 0.7;
  food_coeff = 0.4;
}

const pheromones_range = 50;
const pheromones_resolution = 10;
const pheromones_food_ttl = 50000;
const pheromones_home_ttl = 50000 * 5;
const home_decay = 0.99;
const food_decay = 0.99;
const field_of_view = Math.PI / 4;

const home_radius = 25;
const home_color = "#B64D3A";
```

### Pheromones

To activate the "pheromone" mode change these to true:

```javascript
const do_pheromones = true;
const do_pheromone_draw = true;
```

Or use the provided keyboard commands:

- **shift** key to toggle the pheromones mode.
- **D** key to toggle the pheromone drawing feature.

This feature needs to be tuned to work well.

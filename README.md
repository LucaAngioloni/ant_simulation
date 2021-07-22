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

const do_pheromones = false;
const do_pheromone_draw = false;

let momentum = 0.65; // memory
let randomness = 0.15;
let home_coeff = 0.2;
let food_coeff = 0.2;

if (do_pheromones) {
  momentum = 0.15;
  randomness = 0.05;
  home_coeff = 0.55;
  food_coeff = 0.55;
}

const home_radius = 25;
const home_color = "#B64D3A";
```

### Pheromones

To activate the "pheromone" mode change these to true:

```javascript
const do_pheromones = true;
const do_pheromone_draw = true;
```

This mode is still not quite ready. Needs some fixes.

// Get window size
const w = window.innerWidth;
const h = window.innerHeight;

const shift_key = 16;
const d_key = 68;

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

if (do_pheromones) {
  set_pheromones_coeff();
}

/**
 * Function that toggles the pheromones behaviour.
 */
function toggle_pheromones() {
  do_pheromones = !do_pheromones;
  if (do_pheromones) {
    set_pheromones_coeff();
  } else {
    set_normal_coeff();
  }
}

/**
 * @type {FoodSource|FoodSourceConcentrated}
 */
let food_source;

/**
 * @type {Ant[]}
 */
let ants = [];

const pheromones_range = 50;
const pheromones_resolution = 10;
const pheromones_food_ttl = 50000;
const pheromones_home_ttl = 50000 * 5;
const home_decay = 0.99;
const food_decay = 0.99;
const field_of_view = Math.PI / 4;

let home_pheromones = [];
let food_pheromones = [];
for (let i = 0; i < Math.ceil(w / pheromones_resolution); i++) {
  let row_h = [];
  let row_f = [];
  for (let j = 0; j < Math.ceil(h / pheromones_resolution); j++) {
    row_h.push(0);
    row_f.push(0);
  }
  home_pheromones.push(row_h);
  food_pheromones.push(row_f);
}

const pheromones = {
  pheromones_resolution,
  pheromones_range,
  pheromones_food_ttl,
  pheromones_home_ttl,
  home_pheromones,
  food_pheromones,
  home_decay,
  food_decay,
  field_of_view,
};

const home_radius = 25;
const home_color = "#B64D3A";
let home;

// ------------------------------------------------------------------

/**
 * P5.js setup function. Called just once at the beginning.
 */
function setup() {
  createCanvas(w, h);
  frameRate(fr);

  // Place the home in a random spot
  home = createVector(random(0, w), random(0, h));

  // Generate ants
  for (let index = 0; index < ant_number; index++) {
    ants.push(new Ant(home, w, h, ant_speed, ant_radius));
  }

  // food_source = new FoodSource(w, h, food_quantity, food_rate, food_refill);
  food_source = new FoodSourceConcentrated(
    w,
    h,
    food_quantity,
    food_rate,
    food_refill,
    food_locations
  );
}

/**
 * P5.js draw function. This is called in a loop for every frame rendered.
 */
function draw() {
  // Refill food
  food_source.time_step();

  // Draw
  background(background_color);

  // Keyboard controls
  throttole--;
  if (throttole <= 0) {
    if (keyIsDown(shift_key)) {
      toggle_pheromones();
      throttole = throttle_frames;
    }

    if (keyIsDown(d_key)) {
      do_pheromone_draw = do_pheromones ? !do_pheromone_draw : false;
      // do_pheromone_draw = !do_pheromone_draw;
      throttole = throttle_frames;
    }
  }

  if (do_pheromones && do_pheromone_draw) {
    draw_pheromones();
  }

  // Food
  fill(food_color);
  stroke(food_stroke);
  for (let i = 0; i < food_source.food.length; i++) {
    const f = food_source.food[i];
    ellipse(f.x, f.y, food_radius, food_radius);
  }

  // Ants
  stroke(ant_stroke);
  for (let i = 0; i < ants.length; i++) {
    let ant = ants[i];

    if (do_pheromones) {
      ant.move_pheromones(
        momentum,
        randomness,
        food_coeff,
        home_coeff,
        food_source.food,
        pheromones
      );
    } else {
      ant.move(momentum, randomness, food_coeff, home_coeff, food_source.food);
    }

    const f = ant.get_food(food_source.food, food_radius);

    if (f) {
      fill(ant_food_color);
    } else {
      fill(ant_color);
    }

    if (ant.is_home(home, home_radius)) {
      tot_food += 1;
    }

    if (do_pheromones) {
      ant.emit_pheromones(pheromones);
      evaporate();
    }

    ant.draw();
  }

  // Home
  fill(home_color);
  stroke(0);
  ellipse(home.x, home.y, home_radius, home_radius);

  textSize(30);
  // Print FPS
  let fps = frameRate();
  fill(255);
  stroke(0);
  textAlign(LEFT);
  text("FPS: " + fps.toFixed(2), 10, h - 10);

  // Print FOOD
  fill(255);
  stroke(0);
  textAlign(LEFT);
  text("FOOD: " + tot_food, 10, 40);

  // Print Title
  fill(ant_color);
  stroke(home_color);
  textAlign(CENTER);
  text("Ant Simulation", w / 2, 40);

  // Print Pheromone Mode
  fill(255);
  stroke(0);
  textAlign(RIGHT);
  text(do_pheromones ? "Mode: Pheromones" : "Mode: Normal", w - 10, h - 10);

  // Print Instructions
  textSize(20);
  fill(255);
  stroke(0);
  textAlign(RIGHT);
  text("'Shift' to toggle modes,", w - 10, 25);
  text("'D' to toggle pheromones drawing", w - 10, 50);
}

/**
 * This function takes the pheromones values at time t and computes the natual decay of their values.
 */
function evaporate() {
  for (let i = 0; i < Math.ceil(w / pheromones_resolution); i++) {
    for (let j = 0; j < Math.ceil(h / pheromones_resolution); j++) {
      if (pheromones.home_pheromones[i][j] > 0) {
        pheromones.home_pheromones[i][j]--;
      }
      if (pheromones.food_pheromones[i][j] > 0) {
        pheromones.food_pheromones[i][j]--;
      }
    }
  }
}

const food_pher_col = "rgba(255,113,113,";
const home_pher_col = "rgba(159,216,223,";

/**
 * Utility function to draw the pheromones matrices.
 */
function draw_pheromones() {
  for (let i = 0; i < Math.ceil(w / pheromones_resolution); i++) {
    for (let j = 0; j < Math.ceil(h / pheromones_resolution); j++) {
      if (pheromones.home_pheromones[i][j] > 0) {
        let col =
          home_pher_col +
          (
            pheromones.home_pheromones[i][j] / pheromones.pheromones_home_ttl
          ).toFixed(2) +
          ")";
        fill(col);
        stroke(col);
        ellipse(
          i * pheromones_resolution + pheromones_resolution / 2,
          j * pheromones_resolution + pheromones_resolution / 2,
          pheromones_resolution / 2,
          pheromones_resolution / 2
        );
      }
      if (pheromones.food_pheromones[i][j] > 0) {
        let col =
          food_pher_col +
          (
            pheromones.food_pheromones[i][j] / pheromones.pheromones_food_ttl
          ).toFixed(2) +
          ")";
        fill(col);
        stroke(col);
        ellipse(
          i * pheromones_resolution + pheromones_resolution / 2,
          j * pheromones_resolution + pheromones_resolution / 2,
          (pheromones_resolution * pheromones.food_pheromones[i][j]) /
            pheromones.pheromones_food_ttl,
          (pheromones_resolution * pheromones.food_pheromones[i][j]) /
            pheromones.pheromones_food_ttl
        );
      }
    }
  }
}

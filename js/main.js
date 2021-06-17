const w = window.innerWidth;
const h = window.innerHeight;

const fr = 30;

let tot_food = 0;

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

let food_source;
let ants = [];

const pheromones_range = 9;
const pheromones_resolution = 10;
const pheromones_ttl = 36000;

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
  pheromones_ttl,
  home_pheromones,
  food_pheromones,
};

const home_radius = 25;
const home_color = "#B64D3A";
let home;

function setup() {
  createCanvas(w, h);
  frameRate(fr);
  textSize(30);

  home = createVector(random(0, w), random(0, h));
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

function draw() {
  // Refill food
  food_source.time_step();

  // Draw
  background(background_color);

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
    tot_food += ant.is_home(home, home_radius);
    if (do_pheromones) {
      ant.emit_pheromones(pheromones);
      evaporate();
    }
    ant.draw(ant_radius);
  }

  // Home
  fill(home_color);
  stroke(0);
  ellipse(home.x, home.y, home_radius, home_radius);

  textAlign(LEFT);
  // Print FPS
  let fps = frameRate();
  fill(255);
  stroke(0);
  text("FPS: " + fps.toFixed(2), 10, h - 10);

  // Print FOOD
  fill(255);
  stroke(0);
  text("FOOD: " + tot_food, 10, 40);

  // Print Totle
  fill(ant_color);
  stroke(home_color);
  textAlign(CENTER);
  text("Ant Simulation", w / 2, 40);
}

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

function draw_pheromones() {
  for (let i = 0; i < Math.ceil(w / pheromones_resolution); i++) {
    for (let j = 0; j < Math.ceil(h / pheromones_resolution); j++) {
      if (pheromones.home_pheromones[i][j] > 0) {
        let col =
          home_pher_col +
          (
            pheromones.home_pheromones[i][j] / pheromones.pheromones_ttl
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
            pheromones.food_pheromones[i][j] / pheromones.pheromones_ttl
          ).toFixed(2) +
          ")";
        fill(col);
        stroke(col);
        ellipse(
          i * pheromones_resolution + pheromones_resolution / 2,
          j * pheromones_resolution + pheromones_resolution / 2,
          (pheromones_resolution * pheromones.food_pheromones[i][j]) /
            pheromones.pheromones_ttl,
          (pheromones_resolution * pheromones.food_pheromones[i][j]) /
            pheromones.pheromones_ttl
        );
      }
    }
  }
}

const w = window.innerWidth;
const h = window.innerHeight - 50;

const fr = 30;

let tot_food = 0;

const background_color = "#D4B59D";

const food_rate = 60;
const food_refill = 1;
const food_locations = 3;
const food_quantity = 20;
const food_radius = 10;
const food_color = "#D5EFD5";
const food_stroke = "#D5EFD5";

const ant_number = 50;
const ant_radius = 8;
const ant_color = "#572D15";
const ant_stroke = "#572D15";
const ant_speed = 3;

const momentum = 0.6; // memory
const randomness = 0.15;
const home_coeff = 0.25;
const food_coeff = 0.25;

let food_source;
let ants = [];

const home_radius = 25;
const home_color = "#B64D3A";
let home;

function setup() {
  createCanvas(w, h);
  frameRate(fr);
  textSize(30);
  for (let index = 0; index < ant_number; index++) {
    ants.push(new Ant(w, h, ant_speed, ant_radius));
  }
  home = createVector(random(0, w), random(0, h));
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
    ant.move(momentum, randomness, food_coeff, home_coeff, food_source.food);
    const f = ant.get_food(food_source.food, food_radius);
    if (f) {
      fill(home_color);
    } else {
      fill(ant_color);
    }
    tot_food += ant.is_home(home, home_radius);
    ant.draw(ant_radius);
    // ellipse(ant.pos.x, ant.pos.y, ant_radius, ant_radius);
  }

  // Home
  fill(home_color);
  stroke(0);
  ellipse(home.x, home.y, home_radius, home_radius);

  // Print FPS
  let fps = frameRate();
  fill(255);
  stroke(0);
  text("FPS: " + fps.toFixed(2), 10, h - 10);

  // Print FOOD
  fill(255);
  stroke(0);
  text("FOOD: " + tot_food, 10, 40);
}

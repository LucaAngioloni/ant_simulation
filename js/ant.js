/**
 * @typedef {{x: Number, y: Number}} Vector
 */

/**
 * Class that represents the autonomous agent Ant.
 */
class Ant {
  /**
   * Class contructor
   * @constructor
   * @param {Vector} home The vector of the home position
   * @param {Number} w The canvas width
   * @param {Number} h The canvas height
   * @param {Number} speed The speed this Ant can move with
   * @param {Number} radius The radius of the dots that make the Ant drawing
   */
  constructor(home, w, h, speed, radius) {
    // this.pos = createVector(random(0, w), random(0, h));
    this.pos = home;
    this.dir = p5.Vector.random2D().mult(speed);
    this.w = w;
    this.h = h;
    this.speed = speed;
    this.radius = radius;
    this.has_food = false;
    this.home_closeness = 1.0;
    this.food_closeness = 1.0;
  }

  /**
   * This method draws the Ant on the screen
   */
  draw() {
    const dir_vec = p5.Vector.mult(this.dir, this.radius);
    ellipse(this.pos.x, this.pos.y, this.radius, this.radius);
    ellipse(
      this.pos.x + dir_vec.x,
      this.pos.y + dir_vec.y,
      this.radius + 2,
      this.radius + 2
    );
    ellipse(
      this.pos.x - dir_vec.x,
      this.pos.y - dir_vec.y,
      this.radius,
      this.radius
    );
  }

  /**
   * This method checks is the Ant is inside the home circle.
   * @param {Vector} home The vector of the home position.
   * @param {Number} home_radius The radius of the home in pixels.
   * @returns {Boolean} true if the Ant is home, false otherwise.
   */
  is_home(home, home_radius) {
    if (this.pos.dist(home) < home_radius) {
      this.home_closeness = 1.0;
      if (this.has_food) {
        this.has_food = false;
        return true;
      }
    }
    return false;
  }

  /**
   * This method checks if there is food in range of the Ant.
   * If the ant has already food, it returns true, else if there is food in range it takes it and returns true, else it returns false.
   * @param {Array<Vector>} food The list of food pieces as an Array of p5 Vectors.
   * @param {Number} food_radius The radius of the food in pixels.
   * @returns {Boolean} true if the Ant has or has found food, false otherwise.
   */
  get_food(food, food_radius) {
    if (this.has_food) {
      return true;
    }
    for (let i = 0; i < food.length; i++) {
      const f = food[i];
      if (this.pos.dist(f) <= food_radius) {
        this.has_food = true;
        food.splice(i, 1);
        this.food_closeness = 1.0;
        return true;
      }
    }
    return false;
  }

  /**
   * Get a vector that represents the direction towards home from this Ant.
   * @param {Vector} home The vector of the home position.
   * @returns {Vector} the direction towards home.
   */
  home_dir(home) {
    return p5.Vector.sub(home, this.pos).normalize();
  }

  /**
   * Get a general direction for food from this Ant.
   * @param {Array<Vector>} food The list of food pieces as an Array of p5 Vectors.
   * @returns {Vector} Vector with the general direction of food from this Ant.
   */
  food_dir(food) {
    let food_dir = createVector(0, 0);
    for (let i = 0; i < food.length; i++) {
      const f = food[i];
      const dist_dir = p5.Vector.sub(f, this.pos);
      food_dir = p5.Vector.add(
        food_dir,
        dist_dir.mult(Math.exp(-0.1 * dist_dir.mag()))
      );
    }
    if (food_dir.mag() > 1.0) {
      food_dir.normalize();
    }
    return food_dir;
  }

  /**
   * Method called every frame draw from the main loop.
   * It handles the movement of this Ant and computes a new position.
   * @param {Number} momentum Coefficient that handles how much momentum the Ant should have.
   * @param {Number} randomness Coefficient that handles how much random exploration the Ant should do.
   * @param {Number} food_coeff Coefficient that handles how much the Ant should follow the food trace.
   * @param {Number} home_coeff Coefficient that handles how much the home direction contributes to the movement if the Ant has food.
   * @param {Array<Vector>} food The list of food pieces as an Array of p5 Vectors.
   */
  move(momentum, randomness, food_coeff, home_coeff, food) {
    let directions = p5.Vector.mult(this.dir, momentum);
    const dir_angle = this.dir.heading();
    const random_angle = p5.Vector.fromAngle(
      random(dir_angle - 1.5, dir_angle + 1.5)
    ); // ??/2 = 1.57079633
    directions.add(p5.Vector.mult(random_angle, randomness));
    if (this.has_food) {
      directions.add(this.home_dir(home).mult(home_coeff));
    } else {
      let food_dir = this.food_dir(food);
      directions.add(food_dir.mult(food_coeff));
    }
    const mov = directions.normalize().mult(this.speed);

    let a = p5.Vector.add(this.pos, mov);
    a.x = constrain(a.x, 0, this.w);
    a.y = constrain(a.y, 0, this.h);
    this.dir = p5.Vector.sub(a, this.pos).normalize();
    this.pos = a;
  }

  /**
   * Method equivalent to `move`, called every frame draw from the main loop.
   * It handles the movement of this Ant and computes a new position using the pheromones.
   * @param {Number} momentum Coefficient that handles how much momentum the Ant should have.
   * @param {Number} randomness Coefficient that handles how much random exploration the Ant should do.
   * @param {Number} food_coeff Coefficient that handles how much the Ant should follow the food trace.
   * @param {Number} home_coeff Coefficient that handles how much the home direction contributes to the movement if the Ant has food.
   * @param {Array<Vector>} food The list of food pieces as an Array of p5 Vectors.
   * @param {Object} pheromones An object containing the Pheromones and their parameters.
   */
  move_pheromones(
    momentum,
    randomness,
    food_coeff,
    home_coeff,
    food,
    pheromones
  ) {
    let directions = p5.Vector.mult(this.dir, momentum);
    const dir_angle = this.dir.heading();
    const random_angle = p5.Vector.fromAngle(
      random(dir_angle - Math.PI / 2, dir_angle + Math.PI / 2)
    );
    directions.add(p5.Vector.mult(random_angle, randomness));

    const x = Math.floor(this.pos.x / pheromones.pheromones_resolution);
    const y = Math.floor(this.pos.y / pheromones.pheromones_resolution);
    const start_x = constrain(
      x - Math.floor(pheromones.pheromones_range / 2),
      0,
      Math.ceil(this.w / pheromones.pheromones_resolution) - 1
    );
    const start_y = constrain(
      y - Math.floor(pheromones.pheromones_range / 2),
      0,
      Math.ceil(this.h / pheromones.pheromones_resolution) - 1
    );
    const end_x = constrain(
      x + Math.floor(pheromones.pheromones_range / 2),
      0,
      Math.ceil(this.w / pheromones.pheromones_resolution) - 1
    );
    const end_y = constrain(
      y + Math.floor(pheromones.pheromones_range / 2),
      0,
      Math.ceil(this.h / pheromones.pheromones_resolution) - 1
    );

    if (this.has_food) {
      let home_dir = createVector(0, 0);
      for (let i = start_x; i <= end_x; i++) {
        for (let j = start_y; j < end_y; j++) {
          let dist_dir = p5.Vector.sub(
            createVector(
              i * pheromones.pheromones_resolution + pheromones_resolution / 2,
              j * pheromones.pheromones_resolution + pheromones_resolution / 2
            ),
            this.pos
          );
          if (
            dist_dir.heading() >
              (dir_angle - pheromones.field_of_view) % (2 * Math.PI) &&
            dist_dir.heading() <
              (dir_angle + pheromones.field_of_view) % (2 * Math.PI) &&
            pheromones.home_pheromones[i][j] > 1
          ) {
            home_dir.add(
              dist_dir
                .normalize()
                .mult(
                  pheromones.home_pheromones[i][j] /
                    pheromones.pheromones_home_ttl
                )
            );
          }
        }
      }
      directions.add(home_dir.normalize().mult(home_coeff));
      //home and home_radius are globals... bad stuff...
      let real_h_dir = p5.Vector.sub(home, this.pos);
      if (real_h_dir.mag() < home_radius * 3) {
        directions.add(real_h_dir.normalize().mult(home_coeff));
      }
      // directions.add(this.home_dir(home).mult(home_coeff));
    } else {
      let food_dir = createVector(0, 0);
      for (let i = start_x; i <= end_x; i++) {
        for (let j = start_y; j < end_y; j++) {
          let dist_dir = p5.Vector.sub(
            createVector(
              i * pheromones.pheromones_resolution +
                pheromones.pheromones_resolution / 2,
              j * pheromones.pheromones_resolution +
                pheromones.pheromones_resolution / 2
            ),
            this.pos
          );
          if (
            dist_dir.heading() >
              (dir_angle - pheromones.field_of_view) % (2 * Math.PI) &&
            dist_dir.heading() <
              (dir_angle + pheromones.field_of_view) % (2 * Math.PI) &&
            pheromones.food_pheromones[i][j] > 1
          ) {
            food_dir.add(
              dist_dir
                .normalize()
                .mult(
                  pheromones.food_pheromones[i][j] /
                    pheromones.pheromones_food_ttl
                )
            );
          }
        }
      }
      directions.add(p5.Vector.mult(food_dir, food_coeff));
      directions.add(this.food_dir(food)); //FIX this
    }

    const mov = directions.normalize().mult(this.speed);

    let a = p5.Vector.add(this.pos, mov);
    a.x = constrain(a.x, 0, this.w);
    a.y = constrain(a.y, 0, this.h);
    this.dir = p5.Vector.sub(a, this.pos).normalize();
    this.pos = a;
  }

  /**
   * This method adds the pheromones generated from this ant to the pheromones data.
   * @param {Object} pheromones An object containing the Pheromones and their parameters.
   */
  emit_pheromones(pheromones) {
    const i = constrain(
      Math.floor(this.pos.x / pheromones.pheromones_resolution),
      0,
      Math.ceil(this.w / pheromones.pheromones_resolution) - 1
    );
    const j = constrain(
      Math.floor(this.pos.y / pheromones.pheromones_resolution),
      0,
      Math.ceil(this.h / pheromones.pheromones_resolution) - 1
    );
    if (this.has_food) {
      pheromones.food_pheromones[i][j] =
        pheromones.pheromones_food_ttl * this.food_closeness;
    } else {
      pheromones.home_pheromones[i][j] =
        pheromones.pheromones_home_ttl * this.home_closeness;
    }

    this.home_closeness = this.home_closeness * pheromones.home_decay;
    this.food_closeness = this.food_closeness * pheromones.food_decay;
  }
}

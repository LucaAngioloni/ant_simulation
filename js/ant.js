class Ant {
  constructor(home, w, h, speed, radius) {
    // this.pos = createVector(random(0, w), random(0, h));
    this.pos = home;
    this.dir = p5.Vector.random2D().mult(speed);
    this.w = w;
    this.h = h;
    this.speed = speed;
    this.radius = radius;
    this.has_food = false;
  }

  draw(radius) {
    const dir_vec = p5.Vector.mult(this.dir, radius);
    ellipse(this.pos.x, this.pos.y, radius, radius);
    ellipse(
      this.pos.x + dir_vec.x,
      this.pos.y + dir_vec.y,
      radius + 2,
      radius + 2
    );
    ellipse(this.pos.x - dir_vec.x, this.pos.y - dir_vec.y, radius, radius);
  }

  is_home(home, home_radius) {
    if (this.pos.dist(home) < home_radius && this.has_food) {
      this.has_food = false;
      return 1;
    }
    return 0;
  }

  get_food(food, food_radius) {
    if (this.has_food) {
      return true;
    }
    for (let i = 0; i < food.length; i++) {
      const f = food[i];
      if (this.pos.dist(f) <= food_radius) {
        this.has_food = true;
        food.splice(i, 1);
        return true;
      }
    }
    return false;
  }

  home_dir(home) {
    return p5.Vector.sub(home, this.pos).normalize();
  }

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

  move(momentum, randomness, food_coeff, home_coeff, food) {
    let directions = p5.Vector.mult(this.dir, momentum);
    const dir_angle = this.dir.heading();
    const random_angle = p5.Vector.fromAngle(
      random(dir_angle - 1.5, dir_angle + 1.5)
    ); // π/2 = 1.57079633
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
            dist_dir.heading() > ((dir_angle - Math.PI / 4) % 2) * Math.PI &&
            dist_dir.heading() < ((dir_angle + Math.PI / 4) % 2) * Math.PI
          ) {
            // home_dir.add(
            //   dist_dir
            //     .normalize()
            //     .mult(
            //       pheromones.pheromones_ttl - pheromones.home_pheromones[i][j]
            //     )
            // );
            home_dir.add(dist_dir.normalize());
          }
        }
      }
      // directions.add(p5.Vector.mult(home_dir.normalize(), home_coeff));
      directions.add(this.home_dir(home).mult(home_coeff));
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
            dist_dir.heading() > ((dir_angle - Math.PI / 3) % 2) * Math.PI &&
            dist_dir.heading() < ((dir_angle + Math.PI / 3) % 2) * Math.PI &&
            pheromones.food_pheromones[i][j] > 2
          ) {
            // food_dir.add(
            //   dist_dir
            //     .normalize()
            //     .mult(
            //       pheromones.pheromones_ttl - pheromones.food_pheromones[i][j]
            //     )
            // );
            food_dir.add(dist_dir.normalize());
          }
        }
      }
      directions.add(p5.Vector.mult(food_dir, food_coeff));
      directions.add(p5.Vector.mult(this.food_dir(food), 0.2));
    }

    const mov = directions.normalize().mult(this.speed);

    let a = p5.Vector.add(this.pos, mov);
    a.x = constrain(a.x, 0, this.w);
    a.y = constrain(a.y, 0, this.h);
    this.dir = p5.Vector.sub(a, this.pos).normalize();
    this.pos = a;
  }

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
      pheromones.food_pheromones[i][j] = pheromones.pheromones_ttl;
    } else {
      pheromones.home_pheromones[i][j] = pheromones.pheromones_ttl;
    }
  }
}

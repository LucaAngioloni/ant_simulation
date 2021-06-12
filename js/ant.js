class Ant {
  constructor(w, h, speed, radius) {
    this.pos = createVector(random(0, w), random(0, h));
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

  move(momentum, randomness, food_coeff, home_coeff, food) {
    let directions = p5.Vector.mult(this.dir, momentum);
    const dir_angle = this.dir.heading();
    const random_angle = p5.Vector.fromAngle(
      random(dir_angle - 1.5, dir_angle + 1.5)
    ); // π/2 = 1.57079633
    directions.add(p5.Vector.mult(random_angle, randomness));
    if (this.has_food) {
      directions.add(
        p5.Vector.sub(home, this.pos).normalize().mult(home_coeff)
      );
    } else {
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
      directions.add(food_dir.mult(food_coeff));
    }
    const mov = directions.normalize().mult(this.speed);

    let a = p5.Vector.add(this.pos, mov);
    a.x = constrain(a.x, 0, this.w);
    a.y = constrain(a.y, 0, this.h);
    this.dir = p5.Vector.sub(a, this.pos).normalize();
    this.pos = a;
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
}

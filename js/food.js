class FoodSource {
  constructor(w, h, number, rate, quantity) {
    this.w = w;
    this.h = h;
    this.rate = rate;
    this.food = [];
    this.generate_food(number);
    this.counter = 0;
    if (quantity) {
      this.quantity = quantity;
    } else {
      this.quantity = 1;
    }
  }

  generate_food(number) {
    for (let index = 0; index < number; index++) {
      this.food.push(createVector(random(0, this.w), random(0, this.h)));
    }
  }

  time_step() {
    this.counter++;
    if (this.counter % this.rate == 0) {
      this.generate_food(this.quantity);
    }
  }
}

class FoodSourceConcentrated {
  constructor(w, h, number, rate, quantity, places) {
    this.w = w;
    this.h = h;
    this.rate = rate;
    this.food = [];
    this.places = places;
    this.get_locations();
    this.generate_food(number);
    this.counter = 0;
    if (quantity) {
      this.quantity = quantity;
    } else {
      this.quantity = 1;
    }
  }

  generate_food(number) {
    for (let loc = 0; loc < this.locations.length; loc++) {
      const location = this.locations[loc];
      for (let index = 0; index < number; index++) {
        let random_dir = p5.Vector.random2D().mult(random(0, this.w * 0.1));
        let fp = p5.Vector.add(location, random_dir);
        fp.x = constrain(fp.x, 0, this.w);
        fp.y = constrain(fp.y, 0, this.h);
        this.food.push(fp);
      }
    }
  }

  time_step() {
    this.counter++;
    if (this.counter % (60 * 30) == 0) {
      this.get_locations();
    }
    if (this.counter % this.rate == 0) {
      this.generate_food(this.quantity);
    }
  }

  get_locations() {
    this.locations = [];
    for (let i = 0; i < this.places; i++) {
      this.locations.push(createVector(random(0, this.w), random(0, this.h)));
    }
  }
}

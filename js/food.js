/**
 * @typedef {{x: Number, y: Number}} Vector
 */

/**
 * Class that represents a food source.
 * A food source keeps track of all the food pieces in the canvas and generates new pieces if and when necessary.
 */
class FoodSource {
  /**
   * This is the FoodSource constructor. It generates the starting food and sets up the object.
   * @constructor
   * @param {Number} w The canvas width
   * @param {Number} h The canvas height
   * @param {Number} number the amount of food to generate at the beginning.
   * @param {Number} rate Number that defines when to generate new food. Every `rate` frames add food.
   * @param {Number} quantity How much food to generate at each food generation.
   */
  constructor(w, h, number, rate, quantity) {
    this.w = w;
    this.h = h;
    this.rate = rate;

    /**
     * @type {Vector[]}
     */
    this.food = [];

    this.generate_food(number);
    this.counter = 0;
    if (quantity) {
      this.quantity = quantity;
    } else {
      this.quantity = 1;
    }
  }

  /**
   * Generate new food and append it to the food Array.
   * @param {Number} number How many food pieces to generate.
   */
  generate_food(number) {
    for (let index = 0; index < number; index++) {
      this.food.push(createVector(random(0, this.w), random(0, this.h)));
    }
  }

  /**
   * Method called at every frame draw. Checks if it's time to generate new food and if so it calls `generate_food`.
   */
  time_step() {
    this.counter++;
    if (this.counter % this.rate == 0) {
      this.generate_food(this.quantity);
    }
  }
}

/**
 * Class that represents a food source that generates food around concentrated regions.
 * A food source keeps track of all the food pieces in the canvas and generates new pieces if and when necessary.
 */
class FoodSourceConcentrated {
  /**
   * This is the FoodSource constructor. It generates the starting food and sets up the object.
   * @constructor
   * @param {Number} w The canvas width
   * @param {Number} h The canvas height
   * @param {Number} number the amount of food to generate at the beginning.
   * @param {Number} rate Number that defines when to generate new food. Every `rate` frames add food.
   * @param {Number} quantity How much food to generate at each food generation.
   * @param {Number} places The number of concentrated food sources/places.
   */
  constructor(w, h, number, rate, quantity, places) {
    this.w = w;
    this.h = h;
    this.rate = rate;

    /**
     * @type {Vector[]}
     */
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

  /**
   * Generate new food and append it to the food Array.
   * @param {Number} number How many food pieces to generate.
   */
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

  /**
   * Method called at every frame draw. Checks if it's time to generate new food and if so it calls `generate_food`.
   */
  time_step() {
    this.counter++;
    if (this.counter % (60 * 30) == 0) {
      this.get_locations();
    }
    if (this.counter % this.rate == 0) {
      this.generate_food(this.quantity);
    }
  }

  /**
   * Method that generates new locations for food.
   */
  get_locations() {
    /**
     * @type {Vector[]}
     */
    this.locations = [];
    for (let i = 0; i < this.places; i++) {
      this.locations.push(createVector(random(0, this.w), random(0, this.h)));
    }
  }
}

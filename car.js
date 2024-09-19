class Car {
  constructor(x, y, width, height, controlType, maxSpeed, ratio, color = "white") {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;

    this.speed = 0;
    this.acceleration = 0.2 * ratio;
    this.maxSpeed = maxSpeed * ratio;
    this.friction = 0.05 * ratio;
    this.angle = 0;
    this.damaged = false;

    this.useBrain = controlType == "AI";

    if (controlType != "DUMMY") {
      this.sensor = new Sensor(this);
      // 6 is the hidden layer and 4 is the output layer
      this.brain = new NeuralNetwork(
        [this.sensor.rayCount, 6, 4]
      );
    }
    this.controls = new Controls(controlType);

    this.img = new Image();
    this.img.src = "images/car.png";

    this.mask = document.createElement("canvas");
    this.mask.width = width;
    this.mask.height = height;

    const maskCtx = this.mask.getContext("2d");
    this.img.onload = () => {
      maskCtx.fillStyle = color;
      maskCtx.rect(0, 0, this.width, this.height);
      maskCtx.fill();

      maskCtx.globalCompositeOperation = "destination-atop";
      maskCtx.drawImage(this.img, 0, 0, this.width, this.height);
    }
  }

  update(roadBorders, traffic) {
    // car is able to move ONLY when it's not damaged
    if (!this.damaged) {
      this.#move();
      this.polygon = this.#createPolygon();
      this.damaged = this.#assessDamage(roadBorders, traffic);
    }
    // update the sensor only if there is one (the vehicle user controls)
    if (this.sensor) {
      this.sensor.update(roadBorders, traffic);
      // receives low value if the object is far away
      // and high value if the object is closerr
      const offsets = this.sensor.readings.map(
        s => s == null ? 0 : 1 - s.offset
      )
      const outputs = NeuralNetwork.feedForward(offsets, this.brain);

      if (this.useBrain) {
        this.controls.forward = outputs[0];
        this.controls.left = outputs[1];
        this.controls.right = outputs[2];
        this.controls.reverse = outputs[3];
      }
    }
  }

  // drawExplosion() {
  //   this.explosion = new Image();
  //   this.src = "images/explosion.png";

  //   this.img.onload = () => {
  //     maskCtx.fillStyle = color;
  //     maskCtx.rect(0, 0, this.width, this.height);
  //     maskCtx.fill();

  //     maskCtx.globalCompositeOperation = "destination-atop";
  //     maskCtx.drawImage(this.img, 0, 0, this.width, this.height);
  //   }
  // }

  #assessDamage(roadBorders, traffic) {
    for (let i = 0; i < roadBorders.length; i++) {
      if (polysIntersect(this.polygon, roadBorders[i])) {
        return true;
      }
    }

    for (let i = 0; i < traffic.length; i++) {
      if (polysIntersect(this.polygon, traffic[i].polygon)) {
        return true;
      }
    }
    return false;
  }

  #createPolygon() {
    const points = [];
    // radius of the vehicle
    const rad = Math.hypot(this.width, this.height) / 2;
    const alpha = Math.atan2(this.width, this.height);
    points.push({
      x: this.x - Math.sin(this.angle - alpha) * rad,
      y: this.y - Math.cos(this.angle - alpha) * rad
    });
    points.push({
      x: this.x - Math.sin(this.angle + alpha) * rad,
      y: this.y - Math.cos(this.angle + alpha) * rad
    });
    points.push({
      x: this.x - Math.sin(Math.PI + this.angle - alpha) * rad,
      y: this.y - Math.cos(Math.PI + this.angle - alpha) * rad
    });
    points.push({
      x: this.x - Math.sin(Math.PI + this.angle + alpha) * rad,
      y: this.y - Math.cos(Math.PI + this.angle + alpha) * rad
    });
    return points;
  }

  // private method
  #move() {
    if (this.controls.forward) {
      this.speed += this.acceleration;
    }
    if (this.controls.reverse) {
      this.speed -= this.acceleration;
    }

    if (this.speed > this.maxSpeed) {
      this.speed = this.maxSpeed;
    }
    if (this.speed < -this.maxSpeed / 2) {
      this.speed = -this.maxSpeed / 2;
    }

    if (this.speed > 0) {
      this.speed -= this.friction;
    }
    if (this.speed < 0) {
      this.speed += this.friction;
    }

    if (Math.abs(this.speed) < this.friction) {
      this.speed = 0;
    }

    if (this.speed != 0) {
      const flip = this.speed > 0 ? 1 : -1;

      if (this.controls.left) {
        this.angle += 0.07 * flip * ratio;
      }
      if (this.controls.right) {
        this.angle -= 0.07 * flip * ratio;
      }
    }

    this.x -= Math.sin(this.angle) * this.speed;
    this.y -= Math.cos(this.angle) * this.speed;
  }

  draw(ctx, drawSensor = false) {
    if (this.sensor && drawSensor) {
      this.sensor.draw(ctx);
    }
    
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(-this.angle);

    if (!this.damaged) {
      ctx.drawImage(
        this.mask,
        -this.width / 2,
        -this.height / 2,
        this.width,
        this.height
      );
    }

    ctx.globalCompositeOperation = "multiply";

    ctx.drawImage(
      this.img,
      -this.width / 2,
      -this.height / 2,
      this.width,
      this.height
    );
    ctx.restore();
  }
}
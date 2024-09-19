class Road {
  // x is center of canvas
  // left is the x coordinate of the left side of canvas
  // right is the x coordinate of the right side of canvas
  constructor(x, width, laneCount) {
    this.x = x;
    this.width = width;
    this.laneCount = laneCount;
    
    this.left = x - width / 2;
    this.right = x + width / 2;

    const infinity = 1000000;
    this.top = -infinity;
    this.bottom = infinity;

    // coordinates of each corner of the canvas (aka. border)
    const topLeft = {x: this.left, y: this.top}
    const topRight = {x: this.right, y: this.top}
    const bottomLeft = {x: this.left, y: this.bottom}
    const bottomRight = {x: this.right, y: this.bottom}

    this.borders = [
      // left border
      [topLeft, bottomLeft],
      // right border
      [topRight, bottomRight]
    ];
  }

  getLaneWidth() {
    return this.width / this.laneCount;
  }

  getLaneCenter(laneIndex) {
    const laneWidth = this.width / this.laneCount;
    return this.left + laneWidth / 2 
    // allows the car to go on the rightmost possible way
    + Math.min(laneIndex, this.laneCount - 1) * laneWidth;
  }

  draw(ctx) {
    ctx.lineWidth = 5;
    ctx.strokeStyle = "white";

    // form middle lanes with dash lines
    for (let i = 1; i <= this.laneCount - 1; i++) {
      // determines the x position of each lane
      const x = lerp(
        this.left,
        this.right,
        i / this.laneCount
      );
    
      // 20px of dash and 20px of space in between
      ctx.setLineDash([20, 20]);
      // draw a lane
      ctx.beginPath();
      ctx.moveTo(x, this.top);
      ctx.lineTo(x, this.bottom);
      ctx.stroke();
    }

    // draw borders
    ctx.setLineDash([])
    this.borders.forEach(border => {
      ctx.beginPath();
      ctx.moveTo(border[0].x, border[0].y);
      ctx.lineTo(border[1].x, border[1].y);
      ctx.stroke();
    })
  }
}
const carCanvas = document.getElementById("carCanvas");
carCanvas.width = 200;
const networkCanvas = document.getElementById("networkCanvas");
networkCanvas.width = 300;

const carCtx = carCanvas.getContext("2d");
const networkCtx = networkCanvas.getContext("2d");

let laneCount = 3;
let road = new Road(carCanvas.width / 2, carCanvas.width * 0.9, laneCount);

let carWidth = road.getLaneWidth() * 0.5;
let carHeight = carWidth * 5 / 3;
let ratio = 3 / laneCount;

const N = 1;
let cars = generateCars(N);
let bestCar = cars[0];

const traffic = [];
generateTraffic();

// load best brain from local storage for the cars
if (localStorage.getItem("bestBrain")) {
  loadBrains();
}

const lanes = document.querySelectorAll("#numLanes button");
lanes.forEach(button => {
  if (parseInt(button.value) === laneCount) {
    button.classList.add("selected");
  }

  button.addEventListener("click", function() {
    laneCount = parseInt(this.value);
    lanes.forEach(btn => btn.classList.remove("selected"));
    button.classList.add("selected");
    resetSimulation();
  }) 
})

// function to reset the simulation when the lane count changes
function resetSimulation() {
  road = new Road(carCanvas.width / 2, carCanvas.width * 0.9, laneCount);
  carWidth = road.getLaneWidth() * 0.5;
  carHeight = carWidth * 5 / 3;
  ratio = 3 / laneCount;

  // regenerate cars and traffic
  cars = generateCars(N);
  bestCar = cars[0];
  generateTraffic();

  if (localStorage.getItem("bestBrain")) {
    loadBrains();
  }
}

// loads best brain from local storage for the vehicles
function loadBrains() {
  for (let i = 0; i < cars.length; i++) {
    // parses the JSON stirng
    cars[i].brain = JSON.parse(
      localStorage.getItem("bestBrain")
    );
    if (i != 0) {
      NeuralNetwork.mutate(cars[i].brain, 0.2);
    }
  }
}

// generate traffic vehicles based on the new lane count
function generateTraffic() {
  traffic.length = 0; // clear the previous traffic
  let maximumCar = laneCount - 1;
  numCars = Math.floor(Math.random() * maximumCar) + 1; 
  for (let i = 0; i < 500; i++) {
    for (let j = 1; j <= numCars; j++) {
      traffic.push(new Car(
        road.getLaneCenter(Math.floor(Math.random() * laneCount)),
        -100 - (4 * carHeight * i),
        carWidth,
        carHeight,
        "DUMMY",
        2,
        ratio,
        getRandomColor()
      )
    );
    }
  }
}

animate();

// serializes best brain into local storage
function save() {
  localStorage.setItem("bestBrain",
    JSON.stringify(bestCar.brain)
  );
}

function discard() {
  localStorage.removeItem("bestBrain");
}

// function to generate AI cars
function generateCars(N) {
  const cars = [];
  for (let i = 1; i <= N; i++) {
    // "KEYS" allows you to control the vehicle
    // "AI" takes care of the vehicle's control
    cars.push(new Car(road.getLaneCenter(1), 100, carWidth, carHeight, "AI", 3, ratio));
  }
  return cars;
}

// animate the simulation
function animate(time) {
  for (let i = 0; i < traffic.length; i++) {
    traffic[i].update(road.borders, []);
  }
  for (let i = 0; i < cars.length; i++) {
    cars[i].update(road.borders, traffic);
  }
  
  bestCar = cars.find(
    c => c.y == Math.min(
          ...cars.map(c => c.y)
    )
  );

  // same size as the vertical length of the screen
  carCanvas.height = window.innerHeight;
  networkCanvas.height = window.innerHeight;

  // camera like movement of the road
  carCtx.save();
  // positions the car closer to the bottom of the canvas
  carCtx.translate(0, -bestCar.y + carCanvas.height * 0.7)

  // draw the road and vehicles
  road.draw(carCtx);
  for (let i = 0; i < traffic.length; i++) {
    traffic[i].draw(carCtx, "red");
  }

  // applies transparency to the rest of the vehicles
  // globalAlpha: transparency
  carCtx.globalAlpha = 0.2;
  for (let i = 0; i < cars.length; i++) {
    cars[i].draw(carCtx, "blue");
  }

  // no transparency for the best vehicle
  carCtx.globalAlpha = 1;
  bestCar.draw(carCtx, "blue", true);

  carCtx.restore();

  // draw the neural network visualizaion
  networkCtx.lineDashOffset = -time / 50;
  Visualizer.drawNetwork(networkCtx, bestCar.brain);

  requestAnimationFrame(animate);
}
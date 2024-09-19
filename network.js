class NeuralNetwork {
  // neuronCounts: number of neurons in each layer
  // each index corresponds to each layer
  constructor(neuronCounts) {
    this.levels = [];
    for (let i = 0; i < neuronCounts.length - 1; i++) {
      this.levels.push(new Level(
        neuronCounts[i],
        neuronCounts[i + 1]
      )); 
    }
  }

  static feedForward(givenInputs, network) {
    let outputs = Level.feedForward(
      givenInputs,
      network.levels[0]
    );
    for (let i = 1; i < network.levels.length; i++) {
      outputs = Level.feedForward(
        outputs,
        network.levels[i]
      );
    }
    return outputs;
  }

  // amount is percentage (0 to 100%)
  static mutate(network, amount = 1) {
    network.levels.forEach(level => {
      for (let i = 0; i < level.biases.length; i++) {
        level.biases[i] = lerp(
          level.biases[i],
          Math.random() * 2 - 1,
          amount
        );
      }

      for (let i = 0; i < level.weights.length; i++) {
        for (let j = 0; j < level.weights[i].length; j++) {
          level.weights[i][j] = lerp(
            level.weights[i][j],
            Math.random() * 2 - 1,
            amount
          );
        }
      }
    })
  }
}

class Level {
  constructor(inputCount, outputCount) {
    this.inputs = new Array(inputCount);
    this.outputs = new Array(outputCount);
    // values for each output neuron
    this.biases = new Array(outputCount);

    // weight connecting each input to each output
    // determines the strength or importance of each input
    this.weights = [];
    for (let i = 0; i < inputCount; i++) {
      this.weights[i] = new Array(outputCount);
    }

    Level.#randomize(this);
  }

  // static keyword for serialization
  // randomization of weights and biases is a typical step in
  // initializing a neural network to allow it to start learning
  static #randomize(level) {
    for (let i = 0; i < level.inputs.length; i++) {
      for (let j = 0; j < level.outputs.length; j++) {
        // Math.random ranges between 0 and 1
        // Math.random * 2 ranges between 0 and 2
        // Math.random * 2 - 1 ranges between -1 and 1          
        level.weights[i][j] = Math.random() * 2 - 1;
      }

      for (let i = 0; i < level.biases.length; i++) {
        level.biases[i] = Math.random() * 2 - 1;
      }
    }
  }

  // performs a forward pass through the level of neural network
  // computing the outputs based on the inputs, weights, and biases
  static feedForward(givenInputs, level) {
    for (let i = 0; i < level.inputs.length; i++) {
      level.inputs[i] = givenInputs[i];
    }

    for (let i = 0; i < level.outputs.length; i++) {
      let sum = 0;
      for (let j = 0; j < level.inputs.length; j++) {
        sum += level.inputs[j] * level.weights[j][i];
      }

      // determine whether to "light up" (activate) the output neuron or not
      if (sum > level.biases[i]) {
        level.outputs[i] = 1;
      } else {
        level.outputs[i] = 0;
      }
    }
    return level.outputs;
  }
}
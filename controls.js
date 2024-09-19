class Controls {
  // no key is pressed initially
  constructor(type) {
    this.forward = false;
    this.left = false;
    this.right = false;
    this.reverse = false;

    switch (type) {
      case "KEYS":
        this.#addKeyboardListeners();
        break;
      case "DUMMY":
        // makes the dummy vehicles move forward
        this.forward = true;
        break;
    }
  }

  // private method
  #addKeyboardListeners() {
    // A certain key is pressed
    document.onkeydown = (event) => {
      switch(event.key) {
        case "ArrowLeft":
          this.left = true;
          break;
        case "ArrowRight":
          this.right = true;
          break;
        case "ArrowUp":
          this.forward = true;
          break;
        case "ArrowDown":
          this.reverse = true;
          break;
      }
    }

    // A certain key is released
    document.onkeyup = (event) => {
      switch(event.key) {
        case "ArrowLeft":
          this.left = false;
          break;
        case "ArrowRight":
          this.right = false;
          break;
        case "ArrowUp":
          this.forward = false;
          break;
        case "ArrowDown":
          this.reverse = false;
          break;
      }
    }
  }
}
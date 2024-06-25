class Canvas {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext("2d");
    this.width = window.innerWidth;
    this.height = window.innerHeight;

    this.image = new Image();
    this.image.src = "./assets/Background.png";
    this.imageLoaded = false;

    this.image.onload = () => {
      this.imageLoaded = true;
    };
  }

  init() {
    this.canvas.width = this.width;
    this.canvas.height = this.height;
  }
}

class Rectangle {
  constructor(canvas, color, width, height, x, y, speed, imageUrl) {
    this.canvas = canvas;
    this.ctx = canvas.ctx;
    this.color = color;
    this.width = width;
    this.height = height;
    this.x = x;
    this.y = y;
    this.speed = speed;
    this.jumpStrength = 7;
    this.velocity = 0;
    this.gravity = 0.2;
    this.rotation = 0;
    this.targetRotation = 0;
    this.image = new Image();
    this.image.src = imageUrl;
    this.imageLoaded = false;

    this.image.onload = () => {
      this.imageLoaded = true;
    };
  }

  draw() {
    this.ctx.save();
    this.ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
    this.ctx.rotate((this.rotation * Math.PI) / 180);

    if (this.imageLoaded) {
      this.ctx.drawImage(
        this.image,
        -this.width / 2,
        -this.height / 2,
        this.width,
        this.height
      );
    } else {
      this.ctx.fillStyle = this.color;
      this.ctx.fillRect(
        -this.width / 2,
        -this.height / 2,
        this.width,
        this.height
      );
    }

    this.ctx.restore();
  }

  fall() {
    this.velocity += this.gravity;
    this.y += this.velocity;

    if (this.velocity > 0) {
      this.targetRotation = Math.min(this.velocity * 5, 45);
    } else {
      this.targetRotation = Math.max(this.velocity * 5, -45);
    }

    this.rotation += (this.targetRotation - this.rotation) * 0.1;

    if (this.y >= this.canvas.height - 40 - this.height) {
      this.y = this.canvas.height - 40 - this.height;
      this.velocity = 0;
    }

    this.draw();
  }

  jump() {
    this.velocity = -this.jumpStrength;
  }

  checkCollision(pipes) {
    for (let pipe of pipes) {
      if (
        this.x < pipe.x + pipe.width &&
        this.x + this.width > pipe.x &&
        this.y < pipe.y + pipe.height &&
        this.y + this.height > pipe.y
      ) {
        return true;
      }
    }
    return false;
  }
}

class Pipes {
  constructor(
    canvas,
    color,
    width,
    height,
    x,
    y,
    speed,
    imageUrl,
    rotation = 0
  ) {
    this.canvas = canvas;
    this.ctx = canvas.ctx;
    this.color = color;
    this.width = width;
    this.height = height;
    this.x = x;
    this.y = y;
    this.speed = speed;
    this.rotation = rotation;
    this.image = new Image();
    this.image.src = imageUrl;
    this.imageLoaded = false;
    this.pipePassed = false;

    this.image.onload = () => {
      this.imageLoaded = true;
    };
  }

  draw() {
    this.ctx.save();
    this.ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
    this.ctx.rotate((this.rotation * Math.PI) / 180);
    if (this.imageLoaded) {
      this.ctx.drawImage(
        this.image,
        -this.width / 2,
        -this.height / 2,
        this.width,
        this.height
      );
    } else {
      this.ctx.fillStyle = this.color;
      this.ctx.fillRect(
        -this.width / 2,
        -this.height / 2,
        this.width,
        this.height
      );
    }
    this.ctx.restore();
  }

  move() {
    this.x -= this.speed;
    this.draw();
  }
}

class Ground {
  constructor(canvas, color, width, height, x, y, imageUrl) {
    this.canvas = canvas;
    this.ctx = canvas.ctx;
    this.color = color;
    this.width = width;
    this.height = height;
    this.x = x;
    this.y = y;
    this.image = new Image();
    this.image.src = imageUrl;
    this.imageLoaded = false;

    this.image.onload = () => {
      this.imageLoaded = true;
    };
  }

  draw() {
    this.ctx.fillStyle = this.color;
    this.ctx.fillRect(this.x, this.y, this.width, this.height);
  }
}

const groundHeight = 40;
const playerHeight = 50;
const playerOffsetLeft = 400;

const pipeWidth = 100;
let pipeHeight = 30;

const gapHeight = 250;

const playerSpeed = 5;
const pipeSpeed = 2;

let score = 0;

const myCanvas = new Canvas("world");
myCanvas.init();

const ground = new Ground(
  myCanvas,
  "green",
  myCanvas.width,
  groundHeight,
  0,
  myCanvas.height - groundHeight,
  "./assets/Ground.png"
);
ground.draw();

const myRect = new Rectangle(
  myCanvas,
  "red",
  playerHeight + 20,
  playerHeight,
  playerOffsetLeft,
  window.innerHeight / 2 - playerHeight / 2,
  playerSpeed,
  "./assets/Flappy Bird.png"
);

const pipes = [];

function createPipes() {
  const bottomPipeHeight =
    Math.random() * (myCanvas.height - gapHeight) + groundHeight;
  const topPipeHeight = myCanvas.height - bottomPipeHeight - gapHeight;

  const pipeImage = new Image();
  pipeImage.src = "./assets/Pipe.png";

  const imgHeight = pipeImage.height;
  const imgWidth = pipeImage.width;

  const yOffset = imgHeight - topPipeHeight;

  pipes.push(
    new Pipes(
      myCanvas,
      "black",
      imgWidth,
      imgHeight,
      window.innerWidth,
      myCanvas.height - bottomPipeHeight,
      pipeSpeed,
      "./assets/Pipe.png"
    )
  );

  pipes.push(
    new Pipes(
      myCanvas,
      "black",
      imgWidth,
      imgHeight,
      window.innerWidth,
      0 - yOffset,
      pipeSpeed,
      "./assets/Pipe.png",
      180
    )
  );
}

setInterval(createPipes, 2000);

createPipes();

let animationFrameId;
let offset = 0;

function animate() {
  animationFrameId = requestAnimationFrame(animate);
  myCanvas.ctx.clearRect(0, 0, myCanvas.width, myCanvas.height);

  ground.draw();
  myRect.fall();

  pipes.forEach((pipe, index) => {
    pipe.move();
    if (pipe.x + pipe.width < 0) {
      pipes.splice(index, 1);
    }

    if (pipe.x + pipe.width < myRect.x && !pipe.passed) {
      pipe.passed = true;
      score++;

      document.getElementById("score").innerHTML = `${Math.floor(score / 2)}`;
    }
  });

  const grounds = document.querySelectorAll(".ground");
  const popup = document.querySelector(".game-over");
  popup.style.display = "none";

  const finalScore = document.querySelector(".final-score");
  finalScore.innerHTML = `${Math.floor(score / 2)}`;

  if (myRect.checkCollision(pipes)) {
    grounds.forEach((ground) => {
      ground.style.animation = `none`;
    });

    popup.style.display = "flex";

    cancelAnimationFrame(animationFrameId);
  }

  if (myRect.y >= myRect.canvas.height - 40 - myRect.height) {
    grounds.forEach((ground) => {
      ground.style.animation = `none`;
    });

    popup.style.display = "flex";

    cancelAnimationFrame(animationFrameId);
  }
}

animate();

window.addEventListener("keydown", (event) => {
  if (event.key === " ") {
    myRect.jump();
  }
});

document.querySelector("#play-again").addEventListener("click", () => {
  window.location.reload();
});

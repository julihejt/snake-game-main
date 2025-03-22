// Define HTML elements
const board = document.getElementById("game-board");
const instructionText = document.getElementById("instruction-text");
const logo = document.getElementById("logo");
const score = document.getElementById("score");
const highScoreText = document.getElementById("highScore");
const gameOverScreen = document.getElementById("game-over-screen");
const finalScoreText = document.getElementById("final-score");
const restartButton = document.getElementById("restart-button");

// Profile icon and elements
const profileIcon = document.getElementById("profile-icon");
const logoutBtn = document.getElementById("logout-btn");

// Define game variables
const gridSize = 20;
let snake = [{ x: 10, y: 10 }];
let food = generateFood();
let highScore = 0;
let direction = "right";
let gameInterval;
let gameSpeedDelay = 200;
let gameStarted = false;

// Draw game map, snake, food
function draw() {
  board.innerHTML = "";
  drawSnake();
  drawFood();
  updateScore();
}

// Draw snake with a face on the head and rounded body segments
function drawSnake() {
  snake.forEach((segment, index) => {
    const snakeElement = createGameElement(
      "div",
      index === 0 ? "snake snake-head" : "snake snake-body"
    );
    setPosition(snakeElement, segment);
    if (index === 0) {
      const tongueElement = document.createElement("div");
      tongueElement.classList.add("tongue");
      snakeElement.appendChild(tongueElement);
    }
    board.appendChild(snakeElement);
  });
}

// Create a snake or food cube/div
function createGameElement(tag, className) {
  const element = document.createElement(tag);
  element.className = className;
  return element;
}

// Set the position of snake or food
function setPosition(element, position) {
  element.style.gridColumn = position.x;
  element.style.gridRow = position.y;
}

// Draw food function
function drawFood() {
  if (gameStarted) {
    const foodElement = createGameElement("div", "food");
    setPosition(foodElement, food);
    board.appendChild(foodElement);
  }
}

// Generate food
function generateFood() {
  let newFoodPosition;
  do {
    newFoodPosition = {
      x: Math.floor(Math.random() * gridSize) + 1,
      y: Math.floor(Math.random() * gridSize) + 1,
    };
  } while (isFoodOnSnake(newFoodPosition));

  return newFoodPosition;
}

// Check if the food is generated on the snake
function isFoodOnSnake(position) {
  return snake.some(
    (segment) => segment.x === position.x && segment.y === position.y
  );
}

// Moving the snake
function move() {
  const head = { ...snake[0] };
  switch (direction) {
    case "up":
      head.y--;
      break;
    case "down":
      head.y++;
      break;
    case "left":
      head.x--;
      break;
    case "right":
      head.x++;
      break;
  }

  snake.unshift(head);

  if (head.x === food.x && head.y === food.y) {
    food = generateFood();
    increaseSpeed();
  } else {
    snake.pop();
  }

  checkCollision();
  draw();
}

// Increase game speed
function increaseSpeed() {
  if (gameSpeedDelay > 50) {
    gameSpeedDelay -= 10;
  }

  console.log(`Game Speed: ${gameSpeedDelay}ms per move`);

  clearInterval(gameInterval);
  gameInterval = setInterval(move, gameSpeedDelay);
}

// Start game function
function startGame() {
  gameStarted = true;
  instructionText.style.display = "none";
  logo.style.display = "none";
  gameOverScreen.style.display = "none";
  gameInterval = setInterval(move, gameSpeedDelay);
}

// Keypress event listener
function handleKeyPress(event) {
  if (!gameStarted && (event.code === "Space" || event.key === " ")) {
    startGame();
  } else {
    switch (event.key) {
      case "ArrowUp":
        if (direction !== "down") direction = "up";
        break;
      case "ArrowDown":
        if (direction !== "up") direction = "down";
        break;
      case "ArrowLeft":
        if (direction !== "right") direction = "left";
        break;
      case "ArrowRight":
        if (direction !== "left") direction = "right";
        break;
    }
  }
}

document.addEventListener("keydown", handleKeyPress);

function checkCollision() {
  const head = snake[0];

  if (head.x < 1 || head.x > gridSize || head.y < 1 || head.y > gridSize) {
    resetGame();
  }

  for (let i = 1; i < snake.length; i++) {
    if (head.x === snake[i].x && head.y === snake[i].y) {
      resetGame();
    }
  }
}

function resetGame() {
  updateHighScore();
  stopGame();
  snake = [{ x: 10, y: 10 }];
  food = generateFood();
  direction = "right";
  gameSpeedDelay = 200;
  updateScore();
}

function updateScore() {
  const currentScore = snake.length - 1;
  score.textContent = currentScore.toString().padStart(3, "0");
}

function stopGame() {
  clearInterval(gameInterval);
  gameStarted = false;
  gameOverScreen.style.display = "block";
  finalScoreText.textContent = `Final Score: ${score.textContent}`;
}

function updateHighScore() {
  const currentScore = snake.length - 1;
  const currentUser = localStorage.getItem("currentUser");

  if (currentScore > highScore) {
    highScore = currentScore;
    highScoreText.textContent = highScore.toString().padStart(3, "0");

    // Save high score for the user in localStorage
    if (currentUser !== "guest") {
      let userScores = JSON.parse(localStorage.getItem(currentUser)) || {};
      userScores.highScore = highScore;
      localStorage.setItem(currentUser, JSON.stringify(userScores));
    }
  }
}

// Restart game button functionality
restartButton.addEventListener("click", () => {
  resetGame();
  startGame();
});

// ----------------- USER AUTHENTICATION -----------------
// Check login status
function checkLoginStatus() {
  console.log("Running checkLoginStatus...");
  const currentUser = localStorage.getItem("currentUser");
  console.log("Current User:", currentUser);

  if (currentUser && currentUser !== "guest") {
    console.log("current user logged in");
    logoutBtn.style.display = "inline-block";
    profileIcon.style.display = "inline-block"; // Show the profile icon if logged in
  } else {
    logoutBtn.style.display = "none";
    profileIcon.style.display = "none"; // Hide the profile icon if not logged in
  }
}

// Profile icon click handler
function redirectToProfile() {
  window.location.href = "/profile"; // Redirect to the profile page (update URL as needed)
}

// Profile page logic to display user data
function loadProfilePage() {
  const currentUser = localStorage.getItem("currentUser");

  if (currentUser && currentUser !== "guest") {
    document.getElementById(
      "profile-username"
    ).textContent = `Username: ${currentUser}`;
    const userScores = JSON.parse(localStorage.getItem(currentUser)) || {};
    const userHighScore = userScores.highScore || 0;
    document.getElementById(
      "profile-high-score"
    ).textContent = `High Score: ${userHighScore.toString().padStart(3, "0")}`;
  }
}

// Handle user registration
document.getElementById("register-btn").addEventListener("click", function () {
  // Hide login form and show the registration form
  document.getElementById("login-form").style.display = "none";
  document.getElementById("register-form").style.display = "block";
});

// Handle registration form submission
document
  .getElementById("register-submit")
  .addEventListener("click", function () {
    let username = document.getElementById("register-username").value;
    let password = document.getElementById("register-password").value;

    // Check if username or password is empty
    if (!username || !password) {
      alert("Username and password cannot be empty!");
      return;
    }

    // Check if the username already exists
    if (localStorage.getItem(username)) {
      alert("User already exists. Try a different username.");
    } else {
      // Store the new user in localStorage
      localStorage.setItem(username, JSON.stringify({ password }));
      alert("Registration successful! Please log in.");

      // Hide the registration form after successful registration
      document.getElementById("register-form").style.display = "none";
      document.getElementById("login-form").style.display = "block"; // Show login form after registration
    }
  });

// Handle user login
document.getElementById("login-btn").addEventListener("click", function () {
  // Hide registration form and show the login form
  document.getElementById("register-form").style.display = "none";
  document.getElementById("login-form").style.display = "block"; // Show login form
});

// Handle login form submission
document.getElementById("login-submit").addEventListener("click", function () {
  let username = document.getElementById("login-username").value;
  let password = document.getElementById("login-password").value;

  let storedUser = JSON.parse(localStorage.getItem(username));

  if (storedUser && storedUser.password === password) {
    alert("Login successful!");
    localStorage.setItem("currentUser", username);
    document.getElementById("login-form").style.display = "none"; // Hide login form
    checkLoginStatus();
    showGame(); // Show the game after successful login
  } else {
    alert("Invalid username or password.");
  }
});

// Handle logging out
function logout() {
  localStorage.removeItem("currentUser");
  alert("You have been logged out.");
  window.location.href = "/"; // Redirect to the homepage or game landing page
}

// Show the game after login
function showGame() {
  document.getElementById("landing-page").style.display = "none"; // Hide landing page
  document.getElementById("game-container").style.display = "block"; // Show game
}

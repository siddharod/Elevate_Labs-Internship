export const TEMPLATES = [
  {
    id: 'starter-web',
    title: 'CodeBuddy Starter Web 🌟',
    category: 'HTML / CSS / JS',
    language: 'html',
    description: 'The classic CodeBuddy starter project with HTML card, gradient CSS, and interactive JS.',
    icon: '🌟',
    files: [
      {
        filename: 'index.html',
        language: 'html',
        is_main: true,
        content: `<!DOCTYPE html>
<html>
<head>
    <title>CodeBuddy</title>
</head>
<body>
    <div class="card">
        <h1>Hello CodeBuddy!</h1>
        <p>Start building your first webpage.</p>
        <button onclick="changeMessage()">Click Me</button>
    </div>
</body>
</html>`
      },
      {
        filename: 'style.css',
        language: 'css',
        is_main: false,
        content: `body {
    margin: 0;
    font-family: Arial, sans-serif;
    background: linear-gradient(135deg, #fff8f0, #ffebf3);
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
}

.card {
    background: white;
    padding: 40px;
    border-radius: 20px;
    text-align: center;
}

h1 {
    color: #a259ff;
}

button {
    padding: 12px 20px;
    border: none;
    border-radius: 12px;
    cursor: pointer;
}`
      },
      {
        filename: 'script.js',
        language: 'javascript',
        is_main: false,
        content: `function changeMessage() {
    alert("Great job! You are coding!");
}`
      }
    ]
  },
  {
    id: 'digital-clock',
    title: 'Digital Neon Clock ⏰',
    category: 'HTML / CSS / JS',
    language: 'html',
    description: 'A glowing, animated digital clock that updates every second with neon CSS styling!',
    icon: '⏰',
    files: [
      {
        filename: 'index.html',
        language: 'html',
        is_main: true,
        content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Digital Neon Clock</title>
</head>
<body>
  <div class="clock-card">
    <div class="clock-tag">⚡ BYTE'S ATOMIC CLOCK</div>
    <div id="time" class="time-display">12:00:00</div>
    <div id="date" class="date-display">Today</div>
    <button onclick="toggleGlow()">Toggle Neon Glow ✨</button>
  </div>
</body>
</html>`
      },
      {
        filename: 'style.css',
        language: 'css',
        is_main: false,
        content: `body {
  margin: 0;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #182033;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}
.clock-card {
  background: #1E293B;
  padding: 3rem 4rem;
  border-radius: 28px;
  box-shadow: 0 20px 50px rgba(0,0,0,0.5);
  border: 2px solid #334155;
  text-align: center;
}
.clock-tag {
  color: #FFD166;
  font-size: 0.9rem;
  font-weight: 700;
  letter-spacing: 2px;
  margin-bottom: 1rem;
}
.time-display {
  font-size: 3.5rem;
  font-weight: 900;
  font-family: monospace;
  color: #65D6B3;
  text-shadow: 0 0 20px rgba(101, 214, 179, 0.4);
}
.date-display {
  color: #94A3B8;
  font-size: 1rem;
  margin-top: 0.5rem;
  margin-bottom: 1.5rem;
}
button {
  background: #9B6DFF;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 12px;
  font-weight: bold;
  cursor: pointer;
  box-shadow: 0 4px 0 #7C3AED;
}
button:active {
  transform: translateY(2px);
  box-shadow: none;
}`
      },
      {
        filename: 'script.js',
        language: 'javascript',
        is_main: false,
        content: `function updateClock() {
  const now = new Date();
  const timeEl = document.getElementById('time');
  const dateEl = document.getElementById('date');
  if (timeEl) timeEl.innerText = now.toLocaleTimeString();
  if (dateEl) dateEl.innerText = now.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' });
}

setInterval(updateClock, 1000);
updateClock();

function toggleGlow() {
  const t = document.getElementById('time');
  if (t) {
    t.style.color = t.style.color === 'rgb(255, 209, 102)' ? '#65D6B3' : '#FFD166';
    alert("Neon theme switched!");
  }
}`
      }
    ]
  },
  {
    id: 'interactive-counter',
    title: 'Fun Clicker Game 🎮',
    category: 'HTML / CSS / JS',
    language: 'html',
    description: 'An interactive score counter with audio-visual candy buttons and celebration alerts!',
    icon: '🎮',
    files: [
      {
        filename: 'index.html',
        language: 'html',
        is_main: true,
        content: `<!DOCTYPE html>
<html>
<head>
  <title>Cookie Clicker Fun</title>
</head>
<body>
  <div class="game-container">
    <div class="cookie" onclick="clickCookie()">🍪</div>
    <h1 id="score">0 Cookies</h1>
    <p>Click the giant cookie to earn points!</p>
    <div class="btn-group">
      <button onclick="resetScore()">Reset</button>
      <button onclick="bonusPoints()">Surprise Box 🎁</button>
    </div>
  </div>
</body>
</html>`
      },
      {
        filename: 'style.css',
        language: 'css',
        is_main: false,
        content: `body {
  margin: 0;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #FFE8D6 0%, #D8E2DC 100%);
  font-family: 'Fredoka', sans-serif, Arial;
  text-align: center;
}
.game-container {
  background: white;
  padding: 40px;
  border-radius: 30px;
  box-shadow: 0 15px 35px rgba(0,0,0,0.1);
  border: 4px solid #FFB703;
}
.cookie {
  font-size: 5rem;
  cursor: pointer;
  user-select: none;
  transition: transform 0.1s ease;
}
.cookie:active {
  transform: scale(1.2) rotate(10deg);
}
h1 {
  color: #FB8500;
  margin: 15px 0 5px;
}
p {
  color: #6C757D;
  margin-bottom: 20px;
}
.btn-group button {
  padding: 10px 18px;
  margin: 0 6px;
  border: none;
  border-radius: 12px;
  background: #023047;
  color: white;
  font-weight: bold;
  cursor: pointer;
}
.btn-group button:hover {
  background: #219EBC;
}`
      },
      {
        filename: 'script.js',
        language: 'javascript',
        is_main: false,
        content: `let score = 0;

function clickCookie() {
  score += 1;
  document.getElementById('score').textContent = score + " Cookies";
  if (score === 10) {
    alert("🎉 Level Up! You reached 10 cookies!");
  }
}

function resetScore() {
  score = 0;
  document.getElementById('score').textContent = "0 Cookies";
}

function bonusPoints() {
  const bonus = Math.floor(Math.random() * 20) + 5;
  score += bonus;
  document.getElementById('score').textContent = score + " Cookies";
  alert("🎁 Lucky Bonus! Added " + bonus + " cookies!");
}`
      }
    ]
  }
];

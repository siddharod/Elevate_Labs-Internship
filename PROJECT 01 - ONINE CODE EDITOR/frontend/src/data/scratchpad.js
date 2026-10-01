/**
 * Default starter files shown when the user opens /workspace/new.
 * These 3 files work together as a complete HTML/CSS/JS web playground.
 */
export const DEFAULT_SCRATCHPAD_FILES = [
  {
    filename: 'index.html',
    language: 'html',
    is_main: true,
    content: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My CodeBuddy Project</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div class="container">
        <h1>Hello, CodeBuddy! 🚀</h1>
        <p>Edit this code to build your own webpage.</p>
        <button id="myBtn" onclick="changeMessage()">Click Me!</button>
        <p id="message"></p>
    </div>
    <script src="script.js"></script>
</body>
</html>`,
  },
  {
    filename: 'style.css',
    language: 'css',
    is_main: false,
    content: `/* Reset & base */
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: 'Segoe UI', sans-serif;
    background: linear-gradient(135deg, #fff8f0, #f0e8ff);
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
}

.container {
    background: white;
    padding: 48px 40px;
    border-radius: 24px;
    box-shadow: 0 8px 32px rgba(0,0,0,0.08);
    text-align: center;
    max-width: 480px;
    width: 90%;
}

h1 {
    color: #a259ff;
    font-size: 2rem;
    margin-bottom: 12px;
}

p {
    color: #64748b;
    margin-bottom: 24px;
    font-size: 1rem;
}

button {
    background: #ffd166;
    color: #182033;
    border: none;
    padding: 14px 28px;
    border-radius: 14px;
    font-size: 1rem;
    font-weight: bold;
    cursor: pointer;
    box-shadow: 0 4px 0 #d97706;
    transition: all 0.1s ease;
}

button:hover {
    background: #ff9f68;
    transform: translateY(-2px);
}

button:active {
    transform: translateY(2px);
    box-shadow: 0 2px 0 #d97706;
}

#message {
    color: #5bc0eb;
    font-weight: bold;
    font-size: 1.1rem;
    margin-top: 16px;
    min-height: 28px;
}`,
  },
  {
    filename: 'script.js',
    language: 'javascript',
    is_main: false,
    content: `// JavaScript makes your page interactive!
const messages = [
    "Great job! Keep coding! 🎉",
    "You're a CodeBuddy superstar! ⭐",
    "Look at you go! 🚀",
    "Coding is your superpower! 💪",
    "You're doing amazing! 🌟",
];

let count = 0;

function changeMessage() {
    const messageEl = document.getElementById('message');
    messageEl.textContent = messages[count % messages.length];
    count++;
    console.log("Button clicked! Count:", count);
}`,
  },
];

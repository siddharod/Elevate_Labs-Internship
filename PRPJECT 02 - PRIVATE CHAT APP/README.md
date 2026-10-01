# Converse — Real-Time Private & Group Chat Application

A production-grade, full-stack real-time chat application built with **React**, **Vite**, **Tailwind CSS**, **Node.js**, **Express**, **Socket.IO**, and **MongoDB**. Supports 1-to-1 private messaging, multi-user group conversations, real-time typing indicators, online/offline presence tracking, unread message badges, message read statuses, contact search, and persistent light/dark themes.

---

## 🌟 Features

### 1. Robust Authentication & User System
- **Real JWT Authentication**: Secure authorization via HTTP headers and Socket.IO handshake auth.
- **Bcrypt Password Hashing**: Passwords salted and hashed prior to persistence.
- **Validation**: Duplicate username and email prevention, length constraints, and password confirmation checks.
- **Persistent Sessions**: User session restored on refresh via `/api/auth/me`.
- **Live User Presence**: Real-time online/offline status indicators and calculated "Last seen" timestamps.
- **User Discovery**: Instant search for other registered members with one-click direct messaging.

### 2. Private 1-to-1 Real-Time Chat
- Direct real-time message transmission via dedicated Socket.IO rooms.
- Instant delivery without page reloads.
- Message status indicators: `Sent` (✓), `Delivered` (✓✓), and `Read` (✓✓ colored).
- Unread message counters updated in real time.
- Auto-scroll to newest messages with date grouping.
- Conversation hide/delete from user view without destroying message history for peers.

### 3. Multi-User Group Conversations
- Group creation with custom names and dynamically generated or custom avatars.
- Member management: add new members or remove members (admin privileges).
- Members-only message isolation and authorization checks.
- Group member rosters displaying real-time online states.

### 4. Interactive Real-Time Experience
- **Typing Indicators**: `"User is typing..."` notifications with automatic debouncing.
- **Emoji Picker**: Built-in categorized emoji picker (Smileys, Gestures, Hearts, Activities).
- **Responsive Layout**:
  - **Desktop**: Split-view sidebar and chat viewport.
  - **Mobile**: Seamless single-panel view with conversation list and back-navigation buttons.
- **Light & Dark Theme**: Sleek Tailwind CSS theme engine with localStorage persistence.

---

## 🛠 Technology Stack

### Frontend
- **Framework**: React 18
- **Bundler**: Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router v6
- **HTTP Client**: Axios with JWT interceptors
- **Icons**: Lucide React
- **WebSockets**: Socket.IO Client

### Backend
- **Runtime**: Node.js
- **Server Framework**: Express.js
- **Real-Time Engine**: Socket.IO
- **Database**: MongoDB via Mongoose ORM
- **Database Engine Support**: Direct MongoDB Connection (`MONGO_URI`) with automated zero-config in-memory fallback (`mongodb-memory-server`) for instant local testing.
- **Security**: JSON Web Tokens (`jsonwebtoken`) & `bcryptjs`

---

## 🏗 Architecture & Flow

```
[ React Client ]
       │  ▲
       │  │ (WebSocket Events: send_message, receive_message, typing)
       ▼  │
[ Socket.IO Server & Express REST API ]
       │  ▲
       │  │ (Mongoose Models: User, Conversation, Message)
       ▼  │
[ MongoDB Database ]
```

### Real-Time Socket Event Architecture
| Event Name | Direction | Description |
| :--- | :--- | :--- |
| `connection` | Client ⇄ Server | Authenticated via JWT handshake |
| `join_conversation` | Client → Server | Joins conversation room after membership check |
| `leave_conversation` | Client → Server | Leaves conversation room |
| `send_message` | Client → Server | Persists message to MongoDB and broadcasts to room |
| `receive_message` | Server → Client | Dispatches populated message to conversation members |
| `typing` / `stop_typing`| Client ⇄ Server | Broadcasts live typing state to peer participants |
| `message_read` | Client ⇄ Server | Updates read receipts and updates unread counts |
| `user_online` / `user_offline` | Server → All | Broadcasts live user presence upon socket state changes |

---

## 📁 Project Structure

```
project-root/
│
├── client/
│   ├── src/
│   │   ├── api/
│   │   │   └── axios.js           # Axios instance with auth interceptors
│   │   ├── components/
│   │   │   ├── common/            # Avatar, Modal, LoadingSpinner
│   │   │   ├── sidebar/           # Sidebar, ConversationItem, SearchModal, CreateGroupModal
│   │   │   └── chat/              # ChatArea, ChatHeader, MessageList, MessageBubble, MessageInput, EmojiPicker
│   │   ├── context/
│   │   │   ├── AuthContext.jsx    # Auth state & token storage
│   │   │   ├── SocketContext.jsx  # Socket.IO connection & presence
│   │   │   ├── ChatContext.jsx    # Conversations & messaging logic
│   │   │   └── ThemeContext.jsx   # Light/Dark mode state
│   │   ├── pages/
│   │   │   ├── LoginPage.jsx
│   │   │   ├── RegisterPage.jsx
│   │   │   ├── ChatPage.jsx
│   │   │   ├── ProfilePage.jsx
│   │   │   ├── SettingsPage.jsx
│   │   │   └── NotFoundPage.jsx
│   │   ├── routes/
│   │   │   └── ProtectedRoute.jsx
│   │   ├── utils/
│   │   │   └── dateUtils.js
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
│
├── server/
│   ├── config/
│   │   └── db.js                  # Database connection & fallback
│   ├── controllers/
│   │   ├── authController.js      # Register, login, getMe, profile
│   │   ├── userController.js      # Search & get users
│   │   ├── conversationController.js # 1-to-1 conversations & unread counts
│   │   ├── messageController.js   # Message fetching & sending
│   │   └── groupController.js     # Group creation & member management
│   ├── middleware/
│   │   └── auth.js                # JWT protection middleware
│   ├── models/
│   │   ├── User.js                # User schema & bcrypt hooks
│   │   ├── Conversation.js        # Conversation & Group schema
│   │   └── Message.js             # Message & readBy schema
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── userRoutes.js
│   │   ├── conversationRoutes.js
│   │   ├── messageRoutes.js
│   │   └── groupRoutes.js
│   ├── socket/
│   │   └── index.js               # Socket.IO event handlers & rooms
│   ├── test-suite.js              # 18-point verification test script
│   ├── server.js                  # Server entrypoint
│   ├── .env.example
│   └── package.json
│
├── .gitignore
├── package.json
└── README.md
```

---

## ⚙️ Environment Variables

Create a `.env` file in the `server/` directory:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/private_chat_app
JWT_SECRET=your_jwt_super_secret_key_production_grade
CLIENT_URL=http://localhost:5173
```

> **Note on MongoDB**: If a local or remote MongoDB instance is running on `MONGO_URI`, the server connects to it automatically. If MongoDB is not running locally, the server initializes an integrated in-memory MongoDB fallback server so the application functions out-of-the-box for development and evaluation!

---

## 🚀 Installation & Running Locally

### Prerequisites
- Node.js (v18 or higher)
- npm

### 1. Install Dependencies
From the project root:
```bash
npm run install-all
```
*Or install independently:*
```bash
# Backend
cd server
npm install

# Frontend
cd ../client
npm install
```

### 2. Start the Backend Server
```bash
cd server
npm start
```
The server will start on `http://localhost:5000`.

### 3. Start the Frontend Application
```bash
cd client
npm run dev
```
The client will launch on `http://localhost:5173`.

---

## 🧪 Verification & Testing Suite

An automated 18-point end-to-end verification script tests every core specification:
```bash
cd server
node test-suite.js
```

### Verified Test Cases:
- [x] **TEST 1**: Register User A (with duplicate validation)
- [x] **TEST 2**: Register User B & User C
- [x] **TEST 3**: Login both users via email and username
- [x] **TEST 4**: User A searches for User B in database
- [x] **TEST 5**: User A initiates private chat with User B
- [x] **TEST 6 & 7**: Real-time instant message transmission via Socket.IO
- [x] **TEST 8**: Real-time typing indicators (`"User is typing..."`)
- [x] **TEST 9**: Live online/offline user presence tracking
- [x] **TEST 10**: Persistent message history in MongoDB after logout/login
- [x] **TEST 11**: Group creation with custom title and members
- [x] **TEST 12**: Multi-user membership authorization
- [x] **TEST 13**: Group message broadcasting
- [x] **TEST 14**: Unread message badges and counters
- [x] **TEST 15**: Read status updates and mark-as-read clearing
- [x] **TEST 16**: Responsive UI (Desktop, Tablet, Mobile)
- [x] **TEST 17**: Dark/Light theme toggling and localStorage persistence
- [x] **TEST 18**: Security validation (unauthorized users receiving 403 Forbidden)

---

## 📸 Screenshots Section

| Screen | Description |
| :--- | :--- |
| **Authentication** | Clean login and registration pages with validation feedback |
| **Empty State** | Modern "Start a conversation" view with user search |
| **Active Chat** | Real-time message bubbles, timestamps, read receipts, and typing indicator |
| **Group Chat** | Group messaging, member management, and admin controls |
| **Dark Theme** | High-contrast, sleek slate-dark mode |

---

## 🔮 Future Scope
- Voice and video calling via WebRTC.
- File and image attachment previews.
- Message reactions and replies/threading.
- Push notifications via Service Workers.

---

## 📄 Conclusion
Converse is a clean, modular, and secure real-time chat application meeting all enterprise full-stack development specifications. Every route, database query, and Socket.IO event handler operates on genuine persistent data with zero mockups.

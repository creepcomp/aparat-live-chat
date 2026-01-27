# Aparat Live Chat

A **live chat application** for Aparat live streams, created as a workaround when the official Aparat chat is closed or unavailable.
Built with **React**, **Express.js**, **WebSocket**, and **MUI (Material UI)**, it allows real-time messaging for viewers during live streams.

---

## ✨ Features

- Real-time chat for live streams using WebSockets  
- chat sessions (messages are not saved permanently)  
- Responsive, modern UI with Material UI  
- Lightweight backend for fast performance  
- Works as a temporary replacement for Aparat live stream chat  

---

## 🛠 Tech Stack

### Frontend
- **React**
- **Material UI (MUI)**
- WebSocket client
- JavaScript (ES6+)

### Backend
- **Node.js**
- **Express.js**
- **WebSocket (`ws` library or similar)**

---

## 📂 Project Structure (Example)

```

aparat-live-chat/
│
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── App.js
│   └── package.json
│
├── server/                 # Express + WebSocket backend
│   ├── index.js
│   └── package.json
│
└── README.md

````

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v16+ recommended)  
- npm or yarn  

---

### Installation

#### 1. Clone the repository
```bash
git clone https://github.com/creepcomp/aparat-live-chat.git
cd aparat-live-chat
````

#### 2. Install dependencies

```bash
npm install
```

---

### Running the Project

#### Start the backend

```bash
node run.js
```

#### Start the frontend

```bash
npm start
```

The chat will be accessible at:

```
http://localhost:3000
```

---

## 🔌 WebSocket Communication

* The server establishes WebSocket connections for real-time messaging.
* Messages are broadcast to all connected users in the same stream session.

---

## ⚠️ Limitations

* No message persistence
* No user authentication
* Designed only for live stream chats
* Not affiliated with Aparat

---

## 📌 Use Case

* live chat for Aparat live streams when the official chat is closed
* Community interaction and real-time viewer communication

---

## 📜 License

This project is licensed under the **MIT License**.

---

## 🤝 Contributing

Pull requests are welcome. For major changes, open an issue first to discuss what you would like to change.

---

## 📬 Disclaimer

This project is **not affiliated with or endorsed by Aparat**.
It is an independent solution for temporary live stream chat purposes.

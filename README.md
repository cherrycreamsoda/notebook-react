# 📝 Notebook – React Note-Taking App

A modern, responsive note-taking application built with **React** and **Node.js**. Features a clean, Apple Notes-inspired interface with real-time saving, search functionality, and intuitive organization tools.

![Version](https://img.shields.io/badge/version-0.2.0-blue.svg)
![React](https://img.shields.io/badge/React-18.2.0-61dafb.svg)
![Node.js](https://img.shields.io/badge/Node.js-Express-green.svg)
![MongoDB](https://img.shields.io/badge/Database-MongoDB-47A248.svg)

---

## ✨ Features

### 📋 Core Functionality

- **Create & Edit Notes**: Rich text editing with auto-save
- **Smart Organization**: Pin important notes, soft-delete with restore
- **Powerful Search**: Real-time search in titles and content
- **Multiple Views**: All, Pinned, and Deleted Notes
- **Keyboard Navigation**: Fully keyboard-accessible

### 🎨 User Experience

- **Responsive Design**: Optimized for all devices
- **Dark Theme**: Sleek, modern dark interface
- **Fullscreen Mode**: Distraction-free writing
- **Real-Time Saving**: Auto-save with visual confirmation
- **Smooth Animations**: Polished transitions and micro-interactions

### 🚀 Advanced Features

- **Collapsible Sidebar**: Maximize writing area
- **Note Statistics**: Live count of all note categories
- **Confirmation Dialogs**: Safe deletions with prompts
- **Error Handling**: Graceful UI and retry options
- **Loading States**: Visual feedback during operations

### 🔮 Coming Soon

- **Theme Customization**: Light/Dark toggle
- **Color Themes**: Custom color palettes
- **User Profiles**: Personal settings and preferences
- **Dashboard**: Insights and analytics for notes

---

## 🛠 Tech Stack

### Frontend

- React 18.2.0
- Webpack 5 (custom setup)
- Babel (ESNext support)
- Lucide React (icons)
- Custom CSS (responsive + variables)

### Backend

- Node.js
- Express.js 4.18.2
- MongoDB
- Mongoose 8.0.3

### Dev Tools

- Nodemon – auto restart server
- Express Validator – input validation
- CORS – cross-origin requests
- Helmet – HTTP security
- Morgan – request logging

---

## 📋 Prerequisites

Ensure the following are installed:

- Node.js (v16+): [Download](https://nodejs.org/)
- MongoDB (v5+): [Download](https://www.mongodb.com/try/download/community)
- npm or yarn (comes with Node.js)

### Verify Installation

```bash
node --version
npm --version
mongod --version
```

---

## 🚀 Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/cherrycreamsoda/notebook-react.git
cd notebook-react-app
```

---

### 2. Backend Setup

```bash
cd server
npm install
```

#### Create `.env` File in `/server`

```env
# Database
MONGODB_URI=mongodb://localhost:27017/notebook

# Server
PORT=5000
NODE_ENV=development

# Frontend
FRONTEND_URL=http://localhost:3000

# Security
JWT_SECRET=your-super-secret-jwt-key-here
```

#### Start MongoDB

**Windows:**

```bash
net start MongoDB
```

**macOS (with Homebrew):**

```bash
brew services start mongodb-community
```

**Linux:**

```bash
sudo systemctl start mongod
```

#### Run Backend Server

```bash
# Development (with auto-restart)
npm run dev

# Production
npm start
```

Runs on: `http://localhost:5000`

---

### 3. Frontend Setup

```bash
cd .. # Back to root
npm install
```

#### Create `.env` File in Root

```env
REACT_APP_API_URL=http://localhost:5000/api
```

#### Start Frontend

```bash
# Development server
npm start

# OR auto-open browser
npm run dev
```

Runs on: `http://localhost:3000`

---

## 🌐 API Endpoints

### Notes API

| Method | Endpoint                   | Description                      |
| ------ | -------------------------- | -------------------------------- |
| GET    | `/api/notes`               | Get all notes (optional filters) |
| GET    | `/api/notes?view=pinned`   | Get pinned notes                 |
| GET    | `/api/notes?view=deleted`  | Get deleted notes                |
| GET    | `/api/notes?search=query`  | Search notes                     |
| POST   | `/api/notes`               | Create a new note                |
| PUT    | `/api/notes/:id`           | Update a note                    |
| PUT    | `/api/notes/:id/pin`       | Toggle pin                       |
| PUT    | `/api/notes/:id/restore`   | Restore a soft-deleted note      |
| DELETE | `/api/notes/:id`           | Soft delete a note               |
| DELETE | `/api/notes/:id/permanent` | Permanently delete a note        |

### Health Check

| Method | Endpoint      | Description      |
| ------ | ------------- | ---------------- |
| GET    | `/api/health` | Check API status |

---

## 📁 Project Structure

```txt
notebook-react-app/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   ├── Sidebar.jsx
│   │   ├── MainContent.jsx
│   │   ├── GlassmorphicFAB.jsx
│   │   ├── LoadingSpinner.jsx
│   │   ├── ErrorMessage.jsx
│   │   └── ConfirmationDialog.jsx
│   ├── contexts/
│   │   └── ThemeContext.jsx
│   ├── services/
│   │   └── api.js
│   ├── styles/
│   │   ├── App.css
│   │   ├── Sidebar.css
│   │   ├── MainContent.css
│   │   └── ...
│   ├── App.jsx
│   └── index.js
├── server/
│   ├── config/
│   │   └── database.js
│   ├── models/
│   │   └── Note.js
│   ├── routes/
│   │   └── notes.js
│   ├── middleware/
│   │   └── errorHandler.js
│   ├── server.js
│   └── .env
├── webpack.config.js
├── babel.config.json
├── package.json
└── README.md
```

---

## 🔧 Development

### Frontend Scripts

```bash
npm start       # Start development
npm run dev     # Dev with auto-open browser
npm run build   # Production build
```

### Backend Scripts

```bash
npm run dev     # Start with nodemon
npm start       # Start production server
```

### Dev Tips

- 🔄 Hot Reload: Auto-reloads for both frontend and backend
- 🐞 Debugging: Use browser console + server logs
- 🧠 DB Explorer: Use **MongoDB Compass** to view data
- 🔬 API Testing: Try Postman or Insomnia for endpoints

---

## 🐛 Troubleshooting

### ❗ MongoDB Connection Error

```
Error: Cannot connect to MongoDB
```

**Fix**: Ensure MongoDB is running and URI is correct.

### ❗ Port Already in Use

```
Error: Port 3000/5000 is already in use
```

**Fix**: Change port in `.env` or kill the process.

### ❗ CORS Error

```
Error: Access to fetch blocked by CORS policy
```

**Fix**: Confirm backend CORS settings match frontend origin.

### 🔄 Reset Database

```bash
mongo
use notebook
db.dropDatabase()
```

---

## 🚀 Deployment

### Frontend (Netlify/Vercel)

1. Build project:
   ```bash
   npm run build
   ```
2. Deploy `/dist` folder
3. Add env var:
   ```env
   REACT_APP_API_URL=https://your-backend-domain.com/api
   ```

### Backend (Heroku/Railway)

1. Set environment variables
2. Use **MongoDB Atlas** as your database
3. Whitelist frontend domain in CORS settings

### Production `.env` Example

```env
# Backend
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/notebook
PORT=5000
NODE_ENV=production
FRONTEND_URL=https://your-frontend-domain.com

# Frontend
REACT_APP_API_URL=https://your-backend-domain.com/api
```

---

## 🤝 Contributing

1. Fork the repo
2. Create your feature branch:
   ```bash
   git checkout -b feature-name
   ```
3. Commit your changes:
   ```bash
   git commit -am 'Add feature'
   ```
4. Push branch:
   ```bash
   git push origin feature-name
   ```
5. Submit a pull request

---

## 👨‍💻 Author

**Hamza Zain**  
GitHub: [@cherrycreamsoda](https://github.com/cherrycreamsoda)

---

## 🙏 Acknowledgments

- Icons by [Lucide](https://lucide.dev/)
- Built with love and modern web tools ❤️

---

**Happy Note-Taking! 📝✨**

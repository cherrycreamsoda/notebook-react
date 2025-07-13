// This is the main server file - think of it as the "brain" of your backend
const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
const helmet = require("helmet")
const morgan = require("morgan")
require("dotenv").config()

// Import our routes (we'll create this next)
const noteRoutes = require("./routes/notes")

// Create Express app - this is like creating your server
const app = express()
const PORT = process.env.PORT || 5000

// MIDDLEWARE - these are like "helpers" that process requests before they reach your routes
// Think of them as security guards and translators

// Helmet - adds security headers (like a security guard for your API)
app.use(helmet())

// Morgan - logs all requests (like a visitor log book)
app.use(morgan("combined"))

// CORS - allows your React app to talk to this backend
// Without this, your browser would block the connection
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000", // Your React app URL
    credentials: true,
  }),
)

// These help Express understand JSON data from your React app
app.use(express.json({ limit: "10mb" }))
app.use(express.urlencoded({ extended: true }))

// ROUTES - these are like different "pages" or "endpoints" your React app can call
// All note-related requests will go to /api/notes
app.use("/api/notes", noteRoutes)

// Health check - a simple endpoint to test if your server is running
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    message: "Notebook API is running",
    timestamp: new Date().toISOString(),
  })
})

// Error handling - catches any errors and sends a nice response
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({
    error: "Something went wrong!",
    message: process.env.NODE_ENV === "development" ? err.message : "Internal server error",
  })
})

// 404 handler - for when someone tries to access a route that doesn't exist
app.use("*", (req, res) => {
  res.status(404).json({ error: "Route not found" })
})

// DATABASE CONNECTION - Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI || "mongodb://localhost:27017/notebook", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("✅ Connected to MongoDB")
    // Start the server only after database connection is successful
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`)
      console.log(`📱 Frontend URL: ${process.env.FRONTEND_URL || "http://localhost:3000"}`)
      console.log(`🔗 API Health: http://localhost:${PORT}/api/health`)
    })
  })
  .catch((error) => {
    console.error("❌ MongoDB connection error:", error)
    process.exit(1)
  })

// Graceful shutdown - properly close database connection when server stops
process.on("SIGINT", async () => {
  console.log("\n🛑 Shutting down gracefully...")
  await mongoose.connection.close()
  process.exit(0)
})

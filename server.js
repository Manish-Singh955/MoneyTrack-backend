const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const session = require("express-session");
const flash = require("connect-flash");
const budgetRoutes = require("./routes/budgetRoutes");
const dashboardRoutes =require("./routes/dashboardRoutes");
const analyticsRoutes =
  require("./routes/analyticsRoutes");
const insightRoutes =
  require("./routes/insightRoutes");
const notificationRoutes =
  require("./routes/notificationRoutes");

const connectDB = require("./config/db");

dotenv.config();

const passport = require("./config/passport");

connectDB();

const app = express();


// Middleware
const allowedOrigins = [
  process.env.FRONTEND_URL || "http://localhost:5173",
  "http://localhost:5174",
];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(
  session({
    secret: process.env.SESSION_SECRET || process.env.JWT_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 10 * 60 * 1000,
    },
  })
);
app.use(flash());
app.use(passport.initialize());


// Routes
app.use(
  "/api/auth",
  require("./routes/authRoutes")
);

app.use(
  "/api/transactions",
  require("./routes/transactionRoutes")
);

app.use(
  "/api/transactions",
  require("./routes/transactionRoutes")
);

app.use(
  "/api/categories",
  require("./routes/categoryRoutes")
);
app.use("/api/budgets", budgetRoutes);
app.use(
  "/api/dashboard",
  dashboardRoutes
);

app.use(
  "/api/analytics",
  analyticsRoutes
);

app.use(
  "/api/insights",
  insightRoutes
);

app.use(
  "/api/notifications",
  notificationRoutes
);

// Test route
app.get("/", (req, res) => {
  res.json({
    message: "FinTrack API is running",
  });
});


// Server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(
    `Server running on http://localhost:${PORT}`
  );
});
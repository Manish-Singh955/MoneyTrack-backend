const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const productionFrontendUrl =
  "https://money-track-frontend-orcin.vercel.app";

// Generate JWT
const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d",
    }
  );
};


const googleCallback = (req, res) => {
  const user = req.user;
  const frontendUrl = process.env.RENDER
    ? productionFrontendUrl
    : process.env.FRONTEND_URL || "http://localhost:5173";
  const userData = {
    id: user._id,
    name: user.name,
    email: user.email,
    currency: user.currency,
    avatar: user.avatar || "",
  };

  const params = new URLSearchParams({
    token: generateToken(user._id),
    user: JSON.stringify(userData),
  });

  res.redirect(`${frontendUrl}/oauth/callback?${params.toString()}`);
};

// REGISTER
const register = async (req, res) => {
  try {
    const { name, email, password, avatar } = req.body;

    // Check required fields
    if (!name || !email || !password) {
      return res.status(400).json({
        message: setFlashMessage(
          req,
          "error",
          "Name, email and password are required"
        ),
      });
    }

    // Check existing user
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        message: setFlashMessage(req, "error", "User already exists"),
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      avatar: avatar || "",
    });

    res.status(201).json({
      message: setFlashMessage(req, "success", "Registration successful"),

      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        currency: user.currency,
        avatar: user.avatar || "",
      },

      token: generateToken(user._id),
    });

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};


// LOGIN
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: setFlashMessage(
          req,
          "error",
          "Email and password are required"
        ),
      });
    }

    // Find user
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        message: setFlashMessage(req, "error", "Invalid email or password"),
      });
    }

    // Compare password
    const isMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!isMatch) {
      return res.status(401).json({
        message: setFlashMessage(req, "error", "Invalid email or password"),
      });
    }

    res.json({
      message: setFlashMessage(req, "success", "Login successful"),

      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        currency: user.currency,
        avatar: user.avatar || "",
      },

      token: generateToken(user._id),
    });

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};


module.exports = {
  register,
  login,
  googleCallback,
};

const setFlashMessage = (req, type, message) => {
  req.flash(type, message);
  return req.flash(type)[0];
};
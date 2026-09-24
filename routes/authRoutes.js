const express = require("express");

const {
  register,
  login,
  googleCallback,
} = require("../controllers/authController");
const passport = require("../config/passport");

const productionFrontendUrl =
  "https://money-track-frontend-orcin.vercel.app";
const googleFailureUrl = process.env.RENDER
  ? productionFrontendUrl
  : process.env.FRONTEND_URL || "http://localhost:5173";

const router = express.Router();

router.post("/register", register);

router.post("/login", login);

router.get(
  "/google",
  (req, res, next) => {
    if (!process.env.GOOGLE_CLIENT_ID) {
      return res.status(503).json({
        message: "Google login is not configured on the server",
      });
    }

    next();
  },
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/callback/google",
  passport.authenticate("google", {
    session: false,
    failureRedirect: `${googleFailureUrl}/login?error=google`,
  }),
  googleCallback
);

module.exports = router;
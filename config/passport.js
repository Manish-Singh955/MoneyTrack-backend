const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/User");

const productionCallbackUrl =
  "https://moneytrack-backend-8zl4.onrender.com/api/auth/callback/google";
const callbackUrl = process.env.RENDER
  ? productionCallbackUrl
  : process.env.GOOGLE_CALLBACK_URL || "http://localhost:5000/api/auth/callback/google";

const googleCredentialsConfigured =
  process.env.GOOGLE_CLIENT_ID &&
  process.env.GOOGLE_CLIENT_SECRET;

if (googleCredentialsConfigured) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: callbackUrl,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value?.toLowerCase();
          const avatar =
            profile.photos?.[0]?.value ||
            profile._json?.picture ||
            "";

          if (!email) {
            return done(new Error("Google account did not provide an email address"));
          }

          let user = await User.findOne({
            $or: [
              { googleId: profile.id },
              { email },
            ],
          });

          if (!user) {
            user = await User.create({
              googleId: profile.id,
              name: profile.displayName || "Google User",
              email,
              password: `google-${profile.id}-${Date.now()}`,
              avatar,
            });
          } else {
            user.googleId = profile.id;
            if (avatar) user.avatar = avatar;
            await user.save();
          }

          return done(null, user);
        } catch (error) {
          return done(error);
        }
      }
    )
  );
}

module.exports = passport;

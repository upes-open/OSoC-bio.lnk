require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const Discord = require('discord.js');
const { Client, Intents } = require('discord.js');


const LocalStrategy = require('passport-local').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;


const session = require('express-session');
const uuid = require('uuid');
const cors = require('cors');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');


const GitHubProfileRouter = require('./routes/GitHubProfile');
const TwitterProfileRouter = require('./routes/TwitterProfile');
const DiscordProfileRouter = require('./routes/DiscordProfile');

const User = require('./models/User');

const app = express();
app.use(cors());

const MONGODB_URI = process.env.MONGO_URI;
const MAX_RETRY_ATTEMPTS = 5;
const RETRY_INTERVAL_MS = 5000;

const connectWithRetry = (retryCount) => {
  if (!retryCount) retryCount = 0;

  if (retryCount >= MAX_RETRY_ATTEMPTS) {
    console.error('MongoDB connection failed after maximum retry attempts.');
    process.exit(1);
  }

  console.log('Attempting to connect to MongoDB...');
  mongoose
    .connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => {
      console.log('Connected to MongoDB');
    })
    .catch((err) => {
      console.error('MongoDB connection error:', err);
      console.log(`Retrying MongoDB connection in ${RETRY_INTERVAL_MS / 1000} seconds...`);

      setTimeout(() => {
        connectWithRetry(retryCount + 1);
      }, RETRY_INTERVAL_MS);
    });
};

if (!MONGODB_URI) {
  console.error('MongoDB connection URI not found in the environment.');
  process.exit(1);
}

connectWithRetry();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    genid: (req) => uuid.v4(),
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true,
  })
);

app.use(passport.initialize());
app.use(passport.session());

passport.use(
  new LocalStrategy(
    { usernameField: 'email' },
    async (email, password, done) => {
      try {
        const user = await User.findOne({ email });
        if (!user) {
          return done(null, false, { message: 'Incorrect email.' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
          return done(null, false, { message: 'Incorrect password.' });
        }

        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }
  )
);

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: 'http://localhost:5000/auth/google/callback',
      passReqToCallback: true,
    },
    async (req, accessToken, refreshToken, profile, done) => {
      try {
        if (req.user) {
          // User is already authenticated via local strategy, link the Google account
          req.user.googleId = profile.id;
          await req.user.save();
          return done(null, req.user);
        } else {
          // User is signing in using Google for the first time, create a new user
          const user = await User.findOne({ googleId: profile.id });
          if (!user) {
            const newUser = new User({
              email: profile.emails[0].value,
              googleId: profile.id,
            });
            await newUser.save();
            return done(null, newUser);
          }
          return done(null, user);
        }
      } catch (err) {
        return done(err);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findById(id)
    .then((user) => {
      done(null, user);
    })
    .catch((err) => {
      done(err);
    });
});

app.post('/login', passport.authenticate('local', {
  successRedirect: '/dashboard',
  failureRedirect: '/login',
}));

app.post('/register', async (req, res) => {
  const { email, password, googleId } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    // You can add additional validation for the email and password here, if needed.

    // Check if a user with the provided email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'User with the provided email already exists.' });
    }

    let user;
    if (googleId) {
      // Google authentication
      user = new User({
        email: email,
        googleId: googleId,
      });
    } else {
      // Local authentication
      const hashedPassword = await bcrypt.hash(password, 10);
      user = new User({ email, password: hashedPassword });
    }

    await user.save();
    return res.json({ message: 'Registration successful.' });
  } catch (err) {
    console.error('Error registering user:', err);
    return res.status(500).json({ message: 'Error registering user.' });
  }
});



app.get('/dashboard', (req, res) => {
  if (req.isAuthenticated()) {
    res.json({ message: 'Successfully authenticated! Welcome to the dashboard.' });
  } else {
    res.status(401).json({ message: 'Authentication failed. Please log in first.' });
  }
});

app.get('/auth/google',
  passport.authenticate('google', { scope: [ 'email', 'profile' ] }
));

app.get( '/auth/google/callback',
  passport.authenticate( 'google', {
    successRedirect: '/protected',
    failureRedirect: '/auth/google/failure'
  })
);
app.get('/check-session', (req, res) => {
  if (req.isAuthenticated()) {
    res.json({ authenticated: true });
  } else {
    res.json({ authenticated: false });
  }
});

function isLoggedIn(req, res, next) {
  req.user ? next() : res.sendStatus(401);
}

app.get('/protected', isLoggedIn, (req, res) => {
  res.send(`Hello ${req.user.displayName}`);
});


app.get('/logout', function (req, res, next) {
  req.logout(function (err) {
    if (err) {
      console.log('Error while logging out:', err);
      return next(err);
    }

    req.session.destroy(function (err) {
      if (err) {
        console.log('Error while destroying the session:', err);
        return next(err);
      }

      // For logging out the Google account, redirect the user to Google's logout URL
      // and pass the returnTo parameter to specify the URL to which the user should be redirected after logging out.
      res.send('Goodbye!');
    });
  });
});


// Routes
app.use(express.json());

///// Scrapping test
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/api', GitHubProfileRouter);
app.use('/api', TwitterProfileRouter);
app.use('/api', DiscordProfileRouter);
////////////////////////

app.get('/', (req, res) => {
  res.send('<h2>Server is running Successfully</h2>');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});

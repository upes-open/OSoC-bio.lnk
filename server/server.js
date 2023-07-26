require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const session = require('express-session');
const uuid = require('uuid'); 
const cors = require('cors'); 
const bcrypt = require('bcrypt');



const User = require('./models/User'); // Assuming the User model is in a separate file

const app = express();
app.use(cors())

const MONGODB_URI = process.env.MONGO_URI;
const MAX_RETRY_ATTEMPTS = 5;
const RETRY_INTERVAL_MS = 5000; // 5 seconds

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
// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Express session middleware
app.use(session({
  genid: (req) => uuid.v4(),
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: true,
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Passport local strategy
passport.use(new LocalStrategy(
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
));

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
// Routes for authentication
app.post('/login', passport.authenticate('local', {
  successRedirect: '/dashboard', // Redirect to the success route (handled by the GET request)
  failureRedirect: '/login', // Redirect to the login page on failed login (handled by the GET request)
}));
;

app.post('/register', async (req, res) => {
  const { email, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ email, password: hashedPassword });
    await user.save();
    res.json({ message: 'Registration successful.' });
  } catch (err) {
    res.status(500).json({ message: 'Error registering user.' });
  }
});

// Example of a protected route
app.get('/dashboard', (req, res) => {
  if (req.isAuthenticated()) {
    // If authenticated, respond with a success message
    res.json({ message: 'Successfully authenticated! Welcome to the dashboard.' });
  } else {
    // If not authenticated, respond with an error message
    res.status(401).json({ message: 'Authentication failed. Please log in first.' });
  }
});

app.get('/check-session', (req, res) => {
  if (req.isAuthenticated()) {
    res.json({ authenticated: true });
  } else {
    res.json({ authenticated: false });
  }
});

app.post('/logout', function(req, res, next) {
  req.logout(function(err) {
    if (err) { return next(err); }
    res.json({ meessage: 'Successfully logged out' });
  });
});

app.get("/", (req,res) => {
  res.send("<h2>Server is running Successfully</h2>")
});
// ... Other routes ...

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});

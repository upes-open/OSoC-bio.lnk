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
// Connect to MongoDB
if (!MONGODB_URI) {
  console.error('MongoDB connection URI not found in the environment.');
  process.exit(1);
}

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

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
// ... Other routes ...

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});

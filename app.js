const express = require('express');
const app = express();
const path = require("path");
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const methodOverride = require("method-override");
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const GitHubStrategy = require('passport-github').Strategy;

const ExpressError = require("./utils/ExpressError");


const User = require('./models/user');


const authRoutes = require('./router/auth');
const panelRoutes = require('./router/panel');
const postRoutes = require('./router/post');

mongoose.connect("mongodb://localhost:27017/SnapBlog");
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error: "));
db.once("open", () => console.log("Database connected"));


app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, 'public')));

const sessionConfig = {
    secret: 'itsasecret',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
};

app.use(session(sessionConfig));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

passport.use(new LocalStrategy(User.authenticate()));

// GitHub strategy
passport.use(new GitHubStrategy({
    clientID: 'ad4624f7d65972e6aeb1',
    clientSecret: '7d1159f45f4414b8a3c8132220da98de39c4b2bb',
    callbackURL: 'http://snapBlog.liara.run/auth/github/callback'
},
    async (accessToken, refreshToken, profile, done) => {
        try {
            let user = await User.findOne({ 'githubId': profile.id });

            if (!user) {
                // Create a new user in your database with details from GitHub profile
                const newUser = new User({
                    username: profile.username,
                    email: profile.email || `${profile.username}@github.com`,
                    githubId: profile.id
                });

                user = await newUser.save();
            }

            return done(null, user);
        } catch (err) {
            console.error('GitHub Authentication Error:', err);
            return done(err);
        }
    }));

app.use((req, res, next) => {
    res.locals.currentUser = req.user || {username: 'guest'};
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
});

// *Routes*

app.use('/', authRoutes);
app.use('/user/panel', panelRoutes);
app.use('/posts', postRoutes);

app.get('/', (req, res) => {
    res.render('home');
});


app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404));
});


app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = 'Something went wrong';
    res.status(statusCode).render('error', { err });
});

app.listen(3000, () => {
    console.log('Port #3000');
});
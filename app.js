const express = require('express');
const path = require('path');
const app = express();
const catchAsync = require('./utils/catchAsync');
const ExpressError = require('./utils/ExpressError');
const mongoose = require('mongoose');
const Campground = require('./modules/campground');
const methodOverride = require('method-override');
const { campgroundSchema } = require('./schemas.js');
const Review = require('./modules/review');
const ejsMate = require('ejs-mate');
const campgroundRoutes = require('./routes/Reviews_routes.js'); 
const { date } = require('joi');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./modules/user.js');
const userRoutes = require('./routes/users');
const { isLoggedIn , isAuthor} = require('./middleware');
const multer = require('multer');
const upload = require('./upload.js');
const mongoSanitize = require('express-mongo-sanitize');
mongoose.connect('mongodb://localhost:27017/yelp-camp', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    console.log('Connected to MongoDB');
}).catch(err => {
    console.error('Connection error', err);
});
const dp=mongoose.connection;
const sessionConfig = {
    secret: 'thisshouldbeabettersecret!',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}
app.use(session(sessionConfig))
app.use(passport.initialize());
app.use(passport.session());
///++++
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
//+++++
app.use(flash());
app.use(express.urlencoded({extended:true}))
app.use(express.static('public'));
app.use(express.json());
app.use(cookieParser('aqq'));
app.engine('ejs',ejsMate);
app.use(methodOverride('_method'));
app.use('/uploads', express.static('uploads'));
app.use(mongoSanitize({
    replaceWith: '_'
}))

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname,'views'));
const validateCampground = (req, res, next) => {
    const { error } = campgroundSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}



//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

app.use((req, res, next) => {
    // console.log(req.session);
    // console.log(`Original URL: ${req.originalUrl}`);
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})
app.use('/',campgroundRoutes);
app.use('/', userRoutes);

app.get('/', (req, res) => {
    const currentTime = new Date().toISOString();
    res.cookie('time', currentTime, {
        httpOnly: true, // Secure the cookie
        maxAge: 24 * 60 * 60 * 1000,
        signed: true,
      });
      
    res.render('home')
});

app.get('/campgrounds', async (req, res) => {
    const campgrounds = await Campground.find({});
    const timeCookie = req.signedCookies.time;
    res.render('campgrounds/index', { campgrounds })
});
app.get('/campgrounds/new',isLoggedIn ,(req, res) => {
    res.render('campgrounds/new');
})

app.post('/campgrounds',isLoggedIn ,    upload.single('image') ,catchAsync(async (req, res, next) => {
    const auther_id= await req.user.id;
    const campground = new Campground(req.body.campground);
    campground.author=auther_id;

    if (req.file) {
        campground.image = `/uploads/${req.file.filename}`;
    }


    await campground.save();
    req.flash('success', 'Successfully made a new campground!');
    res.redirect(`/campgrounds/${campground._id}`)
}))


app.get('/campgrounds/:id', async (req, res,) => {
    const campground = await Campground.findById(req.params.id).populate({
        path: 'reviews',
        populate: {
            path: 'author'
        }
    }).populate('author');
    let p =false;
    let check=false;
    if(req.isAuthenticated()){
        check=req.user.id;
        if(campground.author.id==req.user.id)
             p=true;}
    res.render('campgrounds/show', { campground , p ,check});
});

app.get('/campgrounds/:id/edit', isLoggedIn, isAuthor ,async (req, res) => {
 
    const campground = await Campground.findById(req.params.id)
    res.render('campgrounds/edit', { campground });
})

app.put('/campgrounds/:id',isLoggedIn ,isAuthor,upload.single('image'),async (req, res) => {
    const { id } = req.params;
    const updatedData = { ...req.body.campground };

    // Check if a new image was uploaded and update the image field
    if (req.file) {
        updatedData.image = `/uploads/${req.file.filename}`;
    }

    // Find the campground by ID and update it
    const campground = await Campground.findByIdAndUpdate(id, updatedData, { new: true });
    res.redirect(`/campgrounds/${campground._id}`)
});
app.delete('/campgrounds/:id', isLoggedIn , isAuthor ,catchAsync(async (req, res) => {
    const { id } = req.params;
    const cm= await Campground.findById(id);
    await Campground.findOneAndDelete(id);
    const allids= cm.reviews;
    for (let reviewId of allids) {
        await Review.findByIdAndDelete(reviewId);
    }
    res.redirect('/campgrounds');
}));














//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ 

app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404))
})

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = 'Oh No, Something Went Wrong!'
    res.status(statusCode).render('error', { err })
})

app.listen(3003, () => {
    console.log(`Server is running on http://localhost:${3003}`);
});
require('dotenv').config()

var	express 		= require("express"),
	bodyParser		= require("body-parser"),
	mongoose 		= require("mongoose"),
	flash			= require("connect-flash"),
	passport		= require("passport"),
	LocalStrategy 	= require("passport-local"),
	methodOverride  = require("method-override"),
	Campground  	= require("./models/campground"),
	Comment 		= require("./models/comment"),
	User			= require("./models/user"),
	seedDB			= require("./seeds"),
	path 			= require("path"),
	favicon 		= require('serve-favicon'),
	app 			= express();
	
 
// requiring routes - the brackets show the original path. We use the var name later on and apply it a new shortened path. 
var commentRoutes 		= require("./routes/comments"),
	campgroundRoutes	= require("./routes/campgrounds"),
	indexRoutes 		= require("./routes/index")

app.use(favicon(path.join(__dirname,'public', 'favicon.ico')));
app.use(express.static(__dirname + "/public"));

mongoose.set('useUnifiedTopology', true);
mongoose.set('useFindAndModify', false);

mongoose.connect(process.env.DATABASEURL, {useNewUrlParser: true});

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"))
app.use(methodOverride("_method"));
app.use(flash());

// seedDB();

app.locals.moment = require('moment');

// PASSPORT CONFIGURATION
app.use(require("express-session")({
	secret: "Once again Rusty wins cutest dog!",
	resave: false, 
	saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(async function(req, res, next){
	res.locals.currentUser = req.user;
	if(req.user) {
	 try {
	   let user = await User.findById(req.user._id).populate("notifications", null, { isRead: false }).exec();
	   res.locals.notifications = user.notifications.reverse();
	 } catch(err) {
	   console.log(err.message);
	 }
	}
	res.locals.error = req.flash("error");
	res.locals.success = req.flash("success");
	next();
 });

// Routes that we required above. Brackets show what new path to use will be and is followed by the var which we set above as the original route.
app.use("/", indexRoutes);
app.use("/campgrounds", campgroundRoutes);
app.use("/campgrounds/:id/comments", commentRoutes);


var port = process.env.PORT || 3000;
app.listen(port, function () {
  console.log("Server Has Started!");
});


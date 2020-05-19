var express		= require("express");
var router 		= express.Router();
var Campground 	= require("../models/campground");
var middleware 	= require("../middleware"); 
var request = require("request");
var cloudinary = require('cloudinary');
var NodeGeocoder = require('node-geocoder');
var multer 		= require("multer");
var User = require("../models/user");
var Notification = require("../models/notification");

// =========== Image Upload Configuration =============
//multer config
var storage = multer.diskStorage({
  filename: function(req, file, callback) {
    callback(null, Date.now() + file.originalname);
  }
});
var imageFilter = function (req, file, cb) {
    // accept image files only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
};
var upload = multer({ storage: storage, fileFilter: imageFilter})


cloudinary.config({ 
  cloud_name: 'dpv2hs3r4', 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET
});

var options = {
  provider: 'google',
  httpAdapter: 'https',
  apiKey: process.env.GEOCODER_API_KEY,
  formatter: null
};
var geocoder = NodeGeocoder(options);

// =============================

//INDEX - show all campgrounds
router.get("/", function(req, res){
	var noMatch = null;
	if(req.query.search) {
		const regex = new RegExp(escapeRegex(req.query.search), 'gi');
		// Get all campgrounds from DB
		Campground.find({name: regex}, function(err, allCampgrounds){
		  if(err){
    		console.log(err);
	  	} else {
          if(allCampgrounds.length < 1) {
          noMatch = "Sorry, it doesn't look like we know about that campground yet.";
      }
			  res.render("campgrounds/index",{campgrounds: allCampgrounds, noMatch: noMatch, page: 'campgrounds'});
			  } 
    	});
	} else {
    //get all campgrounds from DB
      Campground.find({}, function(err, allCampgrounds){
          if(err){
              console.log(err);
        } else {
                res.render("campgrounds/index",{campgrounds:allCampgrounds, noMatch: noMatch, page: 'campgrounds'});
            }
        });
    }
});

//CREATE - add new campground to DB
router.post("/", middleware.isLoggedIn, upload.single('image'), (function(req, res) {
  var name = req.body.name, 
      cost = req.body.cost, 
      description = req.body.description,
      author = {
        id: req.user._id,
        username: req.user.username
      },
  created = Date.now(); 
  geocoder.geocode(req.body.location, function(err, data) {
    if (err || !data.length) {
      req.flash('red', 'Invalid Address. Please input correct location.');
      res.redirect('back');
    } else {
    var location = data[0].formattedAddress,
        lat = data[0].latitude,
        lng = data[0].longitude;
    var newCampground = {
        name: name,
        cost: cost,
        location: location,
        lat: lat,
        lng: lng,
        description: description,
        author: author,
        created: created
        };
        cloudinary.v2.uploader.upload(req.file.path, async function(err, result) {
          if (err) {
            req.flash('red', err.message);
            res.redirect('back');
          }
            newCampground.image = result.secure_url;
            newCampground.imageId = result.public_id; 
          try {        
            let campground = await Campground.create(newCampground);
            let user = await User.findById(req.user._id).populate("followers").exec();
            let newNotification = {
              username: req.user.username,
              campgroundId: campground.id
          }
          for(const follower of user.followers) {
            let notification = await Notification.create(newNotification);
            follower.notifications.push(notification);
            follower.save();
          }
        res.redirect("/campgrounds/");
          }
          catch(err) {
            req.flash("error", err.message);
            res.redirect("back");
          }
        })
      }
    })
  }
));  

//NEW 
router.get("/new", middleware.isLoggedIn, function(req, res){
   res.render("campgrounds/new"); 
});

// SHOW 
router.get("/:id", function(req, res){
  //find the campground with provided ID
  Campground.findById(req.params.id).populate("comments").exec(function(err, foundCampground){
      if(err){
          console.log(err);
      } else {
          console.log(foundCampground)
          //render show template with that campground
          res.render("campgrounds/show", {campground: foundCampground});
      }
  });
});

// EDIT
router.get("/:id/edit", middleware.checkCampgroundOwnership, function(req, res){
  console.log("IN EDIT!");
  //find the campground with provided ID
  Campground.findById(req.params.id, function(err, foundCampground){
      if(err){
          console.log(err);
      } else {
          //render show template with that campground
          res.render("campgrounds/edit", {campground: foundCampground});
      }
  });
});

// UPDATE
router.put("/:id", upload.single('image'), function(req, res){
  Campground.findById(req.params.id, async function(err, campground){
      if(err){
          req.flash("error", err.message);
          res.redirect("back");
      } else {
          if (req.file) {
            try {
                await cloudinary.v2.uploader.destroy(campground.imageId);
                var result = await cloudinary.v2.uploader.upload(req.file.path);
                campground.imageId = result.public_id;
                campground.image = result.secure_url;
            } catch(err) {
                req.flash("error", err.message);
                return res.redirect("back");
            }
          }
          campground.name = req.body.name;
          campground.description = req.body.description;
          campground.cost = req.body.cost;
          campground.save();
          req.flash("success","Successfully Updated!");
          res.redirect("/campgrounds/" + campground._id);
      }
  });
});

function escapeRegex(text) {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

// DELETE
router.delete('/:id', function(req, res) {
  Campground.findById(req.params.id, async function(err, campground) {
    if(err) {
      req.flash("error", err.message);
      return res.redirect("back");
    }
    try {
        await cloudinary.v2.uploader.destroy(campground.imageId);
        campground.remove();
        req.flash('success', 'Campground deleted successfully!');
        res.redirect('/campgrounds');
    } catch(err) {
        if(err) {
          req.flash("error", err.message);
          return res.redirect("back");
        }
    }
  });
});

module.exports = router;
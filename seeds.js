var mongoose 	= require("mongoose");
var Campground 	= require("./models/campground");
var Comment 	= require("./models/comment");

var seeds = [
	{
		name: "Cloud's Rest", 
		image: "https://images.unsplash.com/photo-1510312305653-8ed496efae75?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1267&q=80",
		description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed ut ullamcorper eros, at feugiat velit. Proin vitae finibus nisl. Morbi faucibus orci nec ex pretium imperdiet. Integer sodales, nunc sit amet dignissim rhoncus, justo neque commodo massa, non lobortis arcu purus ut libero. Aliquam sed velit nec leo placerat consequat. Ut vestibulum, nisl eu dignissim rutrum, enim mi sodales sem, a elementum dolor orci et libero. Integer id mattis ligula, ac porta erat. Mauris vulputate sem maximus elementum lacinia.Praesent a laoreet lectus, sit amet tincidunt nisi. Aliquam elementum nisi vestibulum, pharetra tellus vel, interdum justo. Aenean tincidunt lacus nisi, in tristique nisl pellentesque eu. Cras et justo sed mauris vestibulum dictum nec at purus. Curabitur sit amet luctus augue. Donec malesuada sem vitae felis aliquam convallis. Curabitur et tincidunt lectus, in tempus erat. Fusce elementum hendrerit erat non facilisis. Ut sit amet blandit libero, ac maximus mi. Pellentesque vitae dui nec lectus sodales aliquet vitae et ligula. Quisque posuere tortor ac sagittis mollis. Nulla accumsan convallis felis, in sodales odio hendrerit sed. Nulla eu gravida est. Integer ligula est, mattis nec luctus nec, ultrices a turpis. Phasellus sagittis rhoncus augue quis accumsan.Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Vestibulum at pharetra diam, vel ultricies elit. Etiam molestie lorem vel tincidunt placerat. Proin purus sem, condimentum sit amet lectus a, viverra ullamcorper lectus. Nulla libero tortor, sodales nec magna volutpat, scelerisque dignissim purus. Cras eget consectetur orci, eu feugiat eros. Donec maximus neque ante, euismod commodo sapien dapibus in."
	},
	{
		name: "Desert Heat", 
		image: "https://images.unsplash.com/photo-1539183204366-63a0589187ab?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=634&q=80",
		description: "blablabla"
	},
	{
		name: "Bishop Peak", 
		image: "https://images.unsplash.com/photo-1486915309851-b0cc1f8a0084?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=634&q=80",
		description: "Nam quis malesuada justo. In pellentesque nisl et sodales sagittis. Sed bibendum massa id libero fringilla molestie sed quis neque. Aenean molestie fermentum velit at vestibulum. Etiam finibus augue ac pulvinar aliquet. Sed vel lorem tincidunt mi congue porttitor vel vitae lorem. Ut viverra lorem at blandit suscipit. Donec id dictum lectus, non luctus dui. In eu feugiat magna."
	}
]

async function seedDB(){
	try {
		await Campground.remove({});
		console.log('Campgrounds removed');
		await Comment.remove({});
		console.log('Comments removed');

		for(const seed of seeds) {
			let	campground = await Campground.create(seed);
			console.log('Campground created');
			let comment = await Comment.create(
				{
					text: 	"This place is great but I wish there was internet",
					author: "Homer"
				}
			)
			console.log('Comment created');
			campground.comments.push(comment);
			campground.save();
			console.log('Comment added to campground');
			}
		} catch(err) {
			console.log(err);
		}
	}

// function seedDB(){
// 			// Remove all campgrounds from DB
// Campground.remove({}, function(err){
// 	if(err){
// 		console.log(err);
// 	}
// 	console.log("removed campgrounds!");
// 			// add a few campgrounds
// 	data.forEach(function(seed){
// 		Campground.create(seed, function(err, campground){
// 			if(err){
// 				console.log(err)
// 			} else {
// 				console.log("added a campground!");
// 															// create a comment
// 				Comment.create(
// 					{
// 						text: 	"This place is great but I wish there was internet",
// 						author: "Homer"
// 					}, function(err, comment){
// 						if(err){
// 							console.log(err);
// 						} else {
// 							campground.comments.push(comment);
// 							campground.save();
// 							console.log("Created new comment");
// 					}
// 			});
// 		}
// 	});
// 			});
// 	});
// 	}
module.exports = seedDB;
var express = require("express");
var bodyParser = require("body-parser");
var logger = require("morgan");
var mongoose = require("mongoose");
var Note = require("./models/Note.js");
var Article = require("./models/Article.js");
var request = require("request");
var cheerio = require("cheerio");
//dear mongoose, pls use promises
mongoose.Promise = Promise;

var app = express();

//activates morgan and b-parser
app.use(logger("dev"));
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:37073/scraper");
var db = mongoose.connection;
//error check for our mongoose db
db.on("error", function(error) {
  console.log("Mongoose Error: ", error);
});
//success check for the db
db.once("open", function() {
  console.log("Mongoose connection successful.");
});

//routes for the whole app

//this creates a new note and passes it to req.body. checks itself for any errors. checks for updates 
app.post("/articles/:id", function(req, res) {
  var newNote = new Note(req.body);
  newNote.save(function(error, doc) {
    if (error) {
      console.log(error);
    }
    else {
      Article.findOneAndUpdate({ "_id": req.params.id }, {new:true},{ "note": doc._id })
      .exec(function(err, doc) {
        if (err) {
          console.log(err);
        };
        else {
          res.send(doc);
        };
      });
    };
  });
});

//essentially same as above, but for saved stuff
app.post("/saved/:id", function(req, res) {
  var newNote = new Note(req.body);
  newNote.save(function(error, doc) {
    if (error) {
      console.log(error);
    }
    else {
      Article.findOneAndUpdate({ "_id": req.params.id }, { "note": doc._id })
      .exec(function(err, doc) {
        if (err) {
          console.log(err);
        }
        else {
          res.send(doc);
        }
      });
    };
  });
});

//allows users to pass an id that builds a query to find matching id in mongo. sends to the body on success
app.get("/articles/:id", function(req, res) {
  Article.find({ "_id": req.params.id })
  .populate("note")
  .exec(function(error, doc) {
    if (error) {
      console.log(error);
    }
    else {
      res.json(doc);
    }
  });
});

//queries mongo for all artcle entries in saved. populates all comments associated with the articles and sends everything to the browser.
app.get("/saved" , function (req, res){
  Article.find().sort({_id: -1})
    .populate('notes')
    .exec(function(err, doc){
      if (err){
        console.log(err);
      } 
      else {
        res.json(doc)
      }
    });
});

//finds and article by its object id. builds a query that searches the db to find a match, if it does, it sends it to the browser
app.get("/articles/:id", function(req, res) {
  Article.findOne({ "_id": req.params.id })
  .populate("note")
  .exec(function(error, doc) {
    if (error) {
      console.log(error);
    }
    else {
      res.json(doc);
    }
  });
});

//creates a new note or replaces a note made by user attached to an article. uses id to track where note belongs
app.post("/articles/:id", function(req, res) {
  var newNote = new Note(req.body);
  newNote.save(function(error, doc) {
    if (error) {
      console.log(error);
    }
    else {
      Article.findOneAndUpdate({ "_id": req.params.id }, { "note": doc._id })
      .exec(function(err, doc) {
        if (err) {
          console.log(err);
        }
        else {
          res.send(doc);
        }
      });
    }
  });
});

//the big scrape function. grabs body of html, then everything within the article tag and builds a model for mongo to use
//then it passes the object to the entry and saves it to the db. tells the browser the scrape's done upon completion
app.get("/scrape", function(req, res) {
  request("https://news.ycombinator.com/jobs", function(error, response, html) {
    var $ = cheerio.load(html);
    $("a.storylink").each(function(i, element) {
      var result = {};
      result.title = $(this).text();
      result.link = $(this).attr("href");
      var entry = new Article(result);
      entry.save(function(err, doc) {
        if (err) {
          console.log(err);
        }
        else {
          console.log(doc);
        }
      });

    });
  });
  res.send("Scrape Complete");
});

//.gets all artcles that have been scraped from mongo. sends docs to browsers as json.
app.get("/articles", function(req, res) {
  Article.find({}, function(error, doc) {
    if (error) {
      console.log(error);
    }
    else {
      res.json(doc);
    }
  });
});

// Listen on port 9000
app.listen(9000, function() {
  console.log("Scraper running on port 9000");
});
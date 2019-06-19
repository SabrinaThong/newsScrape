var express = require("express");
var mongoose = require("mongoose");
var axios = require("axios");
var cheerio = require("cheerio");
//var logger = require("morgan");
var db = require("./models");
var mongojs = require("mongojs")
var PORT = 3000;
var app = express();
var exphbs = require("express-handlebars");

app.use(logger("dev"));
app.use(express.urlencoded({extended: false}));
app.use(express.json());
app.use(express.static("public"));

app.engine("handlebars", exphbs({defaultLayout: "main"}));
app.set("view engine", "handlebars")

// app.get("/", function(req,res) {
//     res.render("index");
// })
// app.get("/all", function(req,res) {
//     res.render("views/layouts/main.handlebars");
// })


var databaseUrl = "NewsScrape";
var collections = ["newScraperdb"];


var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines";

mongoose.connect(MONGODB_URI);

// Hook mongojs configuration to the db variable
var db = mongojs(databaseUrl, collections);
    db.on("error", function(error) {
        console.log("Database Error:", error);
    });

//connecting to Mongo DB
mongoose.connect("mongodb://localhost/newScraperdb", { useNewURLParser: true });



app.get("/scrape", function(req,res) {
    axios.get("https://www.nytimes.com/section/sports/golf").then(function(response) {

        // Load the HTML into cheerio and save it to a variable
        // '$' becomes a shorthand for cheerio's selector commands, much like jQuery's '$'
        var $ = cheerio.load(response.data);
      
        // An empty array to save the data that we'll scrape
        var results = [];
        
        // Select each element in the HTML body from which you want information.
        // NOTE: Cheerio selectors function similarly to jQuery's selectors,
        // but be sure to visit the package's npm page to see how it works
        $("article").each(function(i, element) {
      
          var title = $(element).children().text();
          title = title.split("").join(" ").split("\n").join(" ").trim();
          var link = $(element).find("a").attr("href");
      
          // Save these results in an object that we'll push into the results array we defined earlier
         var scrapedArticles = {
             title: title,
             link: link
         }
          results.push(scrapedArticles);

          db.Article.create(results) 
            .then(function(scraped) {
                console.log(scraped);
            })
            .catch(function(err) {
                console.log(err);
            });

          db.Article.insert(scrapedArticles, function(err,data) {
              if (err) throw err;
              res.json(data);
          })
          
         });
         res.send(results);
        
        // Log the results once you've looped through each of the elements found with cheerio
     });
});
    //getting all of the articles from database
    app.get("/all", function(req,res) {
        db.Article.find({}, function(err,data) {
              if(err) throw err;
              res.json(data);
            });
          });

    app.get("/all/:id", function(req,res) {
        db.Article.findOne({_id: req.params.id})

           // .populate("comment")
            .then(function(results) {
                res.json(results)
            })
            .catch(function(err) {
                res.json(err);
            });
        });
    app.post("/all/:id", function(req,res) {
        db.Comment.create(req.body)
            .then(function(dbComment) {
                return db.Article.findOneAndUpdate(
                    {_id: req.params.id},
                    {Comment:dbComment._id},
                    {new: true}
                )
            })
            .then(function(dbArticle) {
                res.json(dbArticle)
            })
            .catch(function(err) {
                res.json(err)
            })
    })
app.listen(PORT, function() {
    console.log("App running on port " + PORT)
});

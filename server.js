// load...
var express = require("express")
var java = require("java");
var app = express();

// Add classes
java.classpath.push("search.jar")
java.classpath.push("lucene-analyzers-common-6.3.0.jar")
java.classpath.push("lucene-backward-codecs-6.3.0.jar")
java.classpath.push("lucene-core-6.3.0.jar")
java.classpath.push("lucene-queryparser-6.3.0.jar")
// set the view engine to ejs
app.set("view engine", "ejs");
app.use(express.static("public"))


// Main page
app.get("/", function(req, res) {
  res.render("pages/main");
})

var query;
var movies;
var num_elems_per_page = 8;

// Search page
app.get("/search", function(req, res) {
  query = req.query.query;
  page = parseInt(req.query.page);
  movies = java.callStaticMethodSync("irTerm.MovieSearch", "search", query);
  num_movies = movies.sizeSync();
  num_pages = Math.floor(num_movies / num_elems_per_page);
  if (page > num_pages) {
    page = num_pages;
  }

  console.log("Query string is %s", query);
  console.log("Page number is %d", page);
  console.log("Number of pages is %d", num_pages + 1);
  console.log("Number of movies is %d", num_movies);
  console.log("Start %d", page * num_elems_per_page);
  console.log("End %d", (page + 1) * num_elems_per_page);

  if (page < num_pages) {
    selected_movies = movies.subListSync(page * num_elems_per_page, (page + 1) * num_elems_per_page);
  } else {
    selected_movies = movies.subListSync(page * num_elems_per_page, num_movies);
  }

  // Highlight key words
  tokens = query.split(" ");
  console.log("Tokens: ", tokens);
  for (var i = 0; i < tokens.length; i++) {
    for (var j = 0; j < selected_movies.sizeSync(); j++) {
      token = tokens[i];
      selected_movies.getSync(j).setSummary(selected_movies.getSync(j).getSummarySync().replace(token, "<span class=\"highlight\"> " + token + " </span>"));
      console.log("Title: %s", selected_movies.getSync(j).getTitleSync());
      console.log("URL: %s", selected_movies.getSync(j).getUrlSync());
      console.log("Summary: %s", selected_movies.getSync(j).getSummarySync());
    }
  }
  res.render("pages/search", {
    "movies": selected_movies,
    "query_content": query,
    "page": page,
    "num_pages": num_pages + 1
  });
})

// set server.
app.listen(8080);
console.log("Listensing the port 8080.");

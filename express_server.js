const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

// include body parser module so we can submit POST requests with forms
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

// set ejs as the template engine that we will want to use
app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

// function to generate a random string
// https://stackoverflow.com/questions/16106701/how-to-generate-a-random-string-of-letters-and-numbers-in-javascript
function generateRandomString() {
  const textLen = 6;
  var text = "";
  var charset = "abcdefghijklmnopqrstuvwxyz0123456789";
  
  for (var i = 0; i < textLen; i++) {
    text += charset.charAt(Math.floor(Math.random() * charset.length));
  }
 
  return text;
};

// GET app route for the /hello path of our app, this returns the { greeting: 'Hello World!' } object to our template
// first argument of res.render() is the view we pass to the template engine
// second argument of res.render() is the variable containing the 'stuff' we want to insert into that previous view
app.get("/hello", (req, res) => {
  const templateVars = { greeting: 'Hello World!' };
  res.render("hello_world", templateVars);
});

// GET app route handler for "/urls"
app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars)
});

// POST app route for "/urls"
// Respond with 'Ok' (we will replace this)
app.post("/urls", (req, res) => {
  const randomString = generateRandomString();
  urlDatabase[randomString] = req.body.longURL;
  res.redirect(`/urls/${randomString}`)
});

// GET app route for the user to use and test their newly generated short URL from the post above
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

// GET app route for /urls/new app route, remember this needs to come before the /urls/:shortURL app route!
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

// GET app route for short urls
// remember "req.params.shortURL" is shorthand for whatever the user inputted client side in the url /urls/:*HERE*
app.get('/urls/:shortURL', (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
  res.render("urls_show", templateVars);
});

// GET app route for urls.json
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
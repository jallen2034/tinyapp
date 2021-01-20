const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

// include body parser module so we can submit POST requests with forms to our express server
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

// using cookie parser gives us the ability to set cookies as a response and a request property, globally
const cookieParser = require('cookie-parser');
app.use(cookieParser());

// set ejs as the template engine that we will want to use
app.set("view engine", "ejs");
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

// function to generate a 6 char random string, this is not my own implementation:
// https://stackoverflow.com/questions/16106701/how-to-generate-a-random-string-of-letters-and-numbers-in-javascript
const generateRandomString = function() {
  const textLen = 6;
  let text = "";
  let charset = "abcdefghijklmnopqrstuvwxyz0123456789";
  
  for (let i = 0; i < textLen; i++) {
    text += charset.charAt(Math.floor(Math.random() * charset.length));
  }
 
  return text;
};

// POST request to handle when user clicks on a url they wish to delete from: /urls/
app.post("/urls/:shortURL/delete", (req, res) => {
  const keyToDelete = req.params.shortURL;
  delete urlDatabase[keyToDelete];
  res.redirect('/urls');
});

// endpoint to handle a POST to /login in our Express server
// set our cookie for the current logged in username, which was submitted from the form in the header.js
// remember when you set the cookie in this app route is accessible in all other get routes thanks to cookie parser
app.post("/login", (req, res) => {
  res.cookie('username', req.body.username);
  res.redirect('/urls');
});

// endpoint to handle a POST to /logout in my Express server
app.post("/logout", (req, res) => {
  res.clearCookie('username');
  res.redirect('/urls');
});

// POST app route for "/urls"
// Respond with 'Ok' (we will replace this)
app.post("/urls", (req, res) => {
  const randomString = generateRandomString();
  urlDatabase[randomString] = req.body.longURL;
  res.redirect(`/urls/${randomString}`);
});

// post request from /urls/:shortURL to edit a existing url, this takes in the /urls/:shortURL as its first paramater
// store the short url from the requests paramaters, from the client in 'urlToEdit'
// the text from the form in our urls_new.ejs was stored as a key 'edit', we access that key, the new 'long url' text the user inputted is inside that key val pair
// assign this new 'long url' the user entered in into our 'urlDatabase' using the same key name as the we passed in to this app route: urlDatabase[urlToEdit]
// redirect back to the /urls/${urlToEdit} app route after we are done
app.post('/urls/:shortURL', (req, res) => {
  const urlToEdit = req.params.shortURL;
  urlDatabase[urlToEdit] = req.body.edit;
  res.redirect(`/urls/${urlToEdit}`);
});

// GET route to handle loading the user registration page for the user
app.get("/register", (req, res) => {
  const templateVars = {username: null};
  res.render("register", templateVars);
});

// GET app route handler for: "/urls"
app.get("/urls", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    username: req.cookies["username"]
  };
  res.render("urls_index", templateVars);
});

// GET app route for /urls/new app route, this needs to come before the /urls/:shortURL app route!
// send back the global cookie we created before back into our client encloded in a 'templateVars' object
app.get("/urls/new", (req, res) => {
  const templateVars = {
    username: req.cookies["username"]
  };
  res.render("urls_new", templateVars);
});

// GET app route for short urls
// "req.params.shortURL" is shorthand for whatever the user inputted client side in the url /urls/:*HERE*
// this app route also handles any redirects for when the user clicks on the 'edit' button in urls_index.js
app.get('/urls/:shortURL', (req, res) => {
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    username: req.cookies["username"]
  };
  res.render("urls_show", templateVars);
});

// GET app route for urls.json
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

// get 'edge case' route to re-direct the user to my 404.ejs template, if they try access a route which doesnt exist
app.get('*', (req, res) => {
  const templateVars = {
    error: '404 not found!'
  };
  res.render('404', templateVars);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

// set ejs as the template engine that we will want to use
app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

// app route for the /hello path of our app, this returns the { greeting: 'Hello World!' } object to our template
app.get("/hello", (req, res) => {
  const templateVars = { greeting: 'Hello World!' };
  // first argument is the view we pass to the template engine
  // second argument is the variable containing the 'stuff' we want to insert into that previous view
  res.render("hello_world", templateVars);
});

// app route handler for "/urls"
app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars)
});

// app route for short urls
// remember "req.params.shortURL" is shorthand for whatever the user inputted client side in the url /urls/:*HERE*
app.get('/urls/:shortURL', (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] }
  res.render("urls_show", templateVars);
});

// app route for urls.json
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
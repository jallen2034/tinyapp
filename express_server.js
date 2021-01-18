const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

// route for the index
app.get("/", (req, res) => {
  res.send("Hello!");
});

// app route for urls.json
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

// app route to send back the user hello HTML
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
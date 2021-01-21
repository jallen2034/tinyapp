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

// pseudo 'database' we use to store the urls in memory
const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "kajdhsakl" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" }
};

// global object called users which will be used to store and access the users in the app.
const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
}

// function that will get users by email 
// takes in req.body.email as "userEmail" from the form the user submitted to the login POST app route this function is called
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_objects/Object/values
const passwordvalidator = function (userPassword) {
  for (const value of Object.values(users)) {
    if (value.password === userPassword) {
      return value.id;
    }
  }

  return false;
}

const emailExists = function (userEmail) {
  let returnBool = false;

  for (const value of Object.values(users)) {
    if (value.email === userEmail) {
      returnBool = true;
    }
  }

  return returnBool;
}

const idExists = function (userid) {
  let returnBool = false;

  for (const value of Object.values(users)) {
    if (value.id === userid) {
      returnBool = true;
    }
  }

  return returnBool;
}

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/entries
const urlsForUser = function (userid) {
  const returnUrls = {};

  for (const [key, value] of Object.entries(urlDatabase)) {
    
    console.log("value: ", value);
    console.log("value.userID vs: ", value["userID"]);
    console.log("userid from param: ", userid)
    console.log("value.longURL: ", value["longURL"]);

    if (value["userID"] === userid) {
      returnUrls[userid] = {longURL: value["longURL"], userID: value["userID"] }
    }
  }

  return returnUrls;
}

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

// POST endpoint that will add a new user object to the global users object
// update our global users object to add the new user's email, password and id into said nested object
// create a new cookie and send it to their client track this users login info in their browser
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment
app.post('/register', (req, res) => {
  const { email, password } = req.body;
  const id = generateRandomString();
  const emailIsTaken = emailExists(email);
  const errors = {
    email: "Must provide email!",
    password: "Must provide password!",
    emailInUse: "Email is taken!",
  }
  
  if (!email) {
    const templateVars = {
      error: errors.email
    };
    res.status(400).render('404', templateVars);
  } else if (!password) {
    const templateVars = {
      error: errors.password
    };
    res.status(400).render('404', templateVars);
  } else if (emailIsTaken) {
    const templateVars = {
      error: errors.emailInUse
    };
    res.status(400).render('404', templateVars);  
  } else {
    const user = {id, email, password}
  
    users[id] = user;
    res.cookie('user_id', user.id);
    res.redirect('/urls');
  }
});

// POST request to handle when user clicks on a url they wish to delete from: /urls/
app.post('/urls/:shortURL/delete', (req, res) => {
  const keyToDelete = req.params.shortURL;
  delete urlDatabase[keyToDelete];
  res.redirect('/urls');
});

// endpoint to handle a POST to /login in our Express server
// set our cookie for the current logged in user_id, which was submitted from the form in the header.js
// remember when you set the cookie in this app route is accessible in all other get routes thanks to cookie parser
// call getUsersbyEmail(), which checks if the email in req.body.email exists in the users object
// if its not found, 'user' var will be undefined, below if check catches this instance and wont make a cookie from req.body.email if so
app.post('/login', (req, res) => {
  const { email, password } = req.body;
  const validUserIDPassword = passwordvalidator(password);
  const validUserEmail = emailExists(email);
  const errors = {
    email: "Must provide email!",
    password: "Must provide password!",
    emailNoExist: "Invalid email!",
    invalidPassword: "Invalid Password!"
  };

  if (!email) {
    const templateVars = {
      error: errors.email
    };
    res.status(400).render('404', templateVars);
  } else if (!password) {
    const templateVars = {
      error: errors.password
    };
    res.status(400).render('404', templateVars);
  } else if (!validUserEmail) {
    const templateVars = {
      error: errors.emailNoExist
    };
    res.status(400).render('404', templateVars);
  } else if (!validUserIDPassword) {
    const templateVars = {
      error: errors.invalidPassword
    };
    res.status(400).render('404', templateVars);
  } else {
    res.cookie('user_id', validUserIDPassword);
    res.redirect('/urls');
  }
});

// endpoint to handle a POST to /logout in my Express server
// clear the current cookie that was generated before with the key: "user_id"
app.post('/logout', (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/login');
});

// POST app route that will allow the user to create a new custom URL to be saved in our database
// this route generates a new string, then uses the long url it got from the form tagged with 'longURL' as its name in urls_new.ejs
// it assigns this new long url to urlDatabase[] using randomString as the key and req.body.longURL as the value
// we need to grab user id
// once we get this, go to the database and check it exists, if not redirect user to login
app.post('/urls', (req, res) => {
  const id = req.cookies["user_id"];
  const longUrl = req.body.longURL;
  const idIsExisting = idExists(id);

  if (idIsExisting) {
    const randomURLkey = generateRandomString();
    urlDatabase[randomURLkey] = { longURL: longUrl, userID: id };
    res.redirect(`/urls/${randomURLkey}`);
  } else {
    res.redirect('/login');
  }
});

// post request from /urls/:shortURL to edit a existing url, this takes in the /urls/:shortURL as its first paramater
// store the short url from the requests paramaters, from the client in 'urlToEdit'
// the text from the form in our urls_new.ejs was stored as a key 'edit', we access that key, the new 'long url' text the user inputted is inside that key val pair
// assign this new 'long url' the user entered in into our 'urlDatabase' using the same key name as the we passed in to this app route: urlDatabase[urlToEdit]
// redirect back to the /urls/${urlToEdit} app route after we are done
// https://stackoverflow.com/questions/6084858/javascript-use-variable-as-object-name
app.post('/urls/:shortURL', (req, res) => {
  const id = req.cookies["user_id"];
  const shortUrl = req.params.shortURL;
  const longUrl = req.body.edit

  urlDatabase[shortUrl] = { longURL: longUrl, userID: id };
  res.redirect(`/urls/${shortUrl}`);
});

// GET endpoint to handle loading the user registration page for the user
app.get('/login', (req, res) => {
  const templateVars = {user: null};
  res.render('login', templateVars);
});

// GET route to handle loading the user registration page for the user
app.get('/register', (req, res) => {
  const templateVars = {user: null};
  res.render('register', templateVars);
});

// GET app route handler for: "/urls"
// idExists() is ran and then a simple check is performed to allow or disallow the user from accessing /urls if they are logged in or not
app.get('/urls', (req, res) => {
  const id = req.cookies["user_id"];
  const user = users[id];
  const idIsExisting = idExists(id);

  if (idIsExisting) {
    const filteredUrlDb = urlsForUser(id);
    console.log("filteredUrlDb: ", filteredUrlDb);
    const templateVars = {urls: filteredUrlDb, user};
    res.render('urls_index', templateVars);
  } else {
    res.redirect('/login');
  }
});

// GET app route for /urls/new app route, this needs to come before the /urls/:shortURL app route!
// send back the global cookie we created before back into our client encloded in a 'templateVars' object
// we are passing templateVars a key user_id which value is the cookie coming in with the request from the client which is currently called 'username'
app.get('/urls/new', (req, res) => {
  const id = req.cookies["user_id"];
  const user = users[id];
  const idIsExisting = idExists(id);

  if (idIsExisting) {
    const templateVars = {urls: urlDatabase, user};
    res.render('urls_new', templateVars);
  } else {
    res.redirect('/login');
  }
});

// GET app route for short urls
// "req.params.shortURL" is shorthand for whatever the user inputted client side in the url /urls/:*HERE*
// this app route also handles any redirects for when the user clicks on the 'edit' button in urls_index.js
app.get('/urls/:shortURL', (req, res) => {
  const id = req.cookies["user_id"];
  const user = users[id];

  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    user
  };
  res.render('urls_show', templateVars);
});

// GET app route for urls.json
app.get('/urls.json', (req, res) => {
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


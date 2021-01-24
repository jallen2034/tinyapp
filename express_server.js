const express = require("express");
const app = express();
const PORT = 8080; 
const {passwordvalidator, emailExists, idExists, generateRandomString, urlsForUser} = require("./helpers.js");
 
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
 
const cookieSession = require('cookie-session');
app.use(cookieSession({
  name: 'session',
  keys: ['key1'],

  maxAge: 24 * 60 * 60 * 1000
}));

const bcrypt = require('bcrypt');
app.set("view engine", "ejs");

const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "kajdhsakl" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" }
};
 
const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    hashedPassword: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    hashedPassword: "dishwasher-funk"
  }
};
 
// POST endpoint that will add a new user object to the global users object
// update our global users object to add the new user's email, haskedPassword and id into said nested object
// create a new cookie and send it to their client track this users login info in their browser, also features more detailed error handling
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment
app.post('/register', (req, res) => {
  const { email, password } = req.body;
  const id = generateRandomString();
  const emailIsTaken = emailExists(email, users);
  const errors = {
    email: "Must provide email!",
    password: "Must provide password!",
    emailInUse: "Email is taken!",
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
  } else if (emailIsTaken) {
    const templateVars = {
      error: errors.emailInUse
    };
    res.status(400).render('404', templateVars);
  } else {
    const hashedPassword = bcrypt.hashSync(password, 10);
    users[id] = {id, email, hashedPassword};
    req.session.user_id = users[id].id;
    res.redirect('/urls');
  }
});
 
// endpoint to handle a POST to /login in our Express server
// call getUsersbyEmail(), which checks if the email in req.body.email exists in the users object
// if its not found, 'validUserEmail' const will be false, below if check catches this instance and wont make a cookie from req.body.email if so
// also features additonal detailed error handling
app.post('/login', (req, res) => {
  const { email, password } = req.body;
  const validUserEmail = emailExists(email, users);
  const isAuthenticated = passwordvalidator(password, users, email);
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
  } else if (!isAuthenticated) {
    const templateVars = {
      error: errors.invalidPassword
    };
    res.status(400).render('404', templateVars);
  } else {
    req.session.user_id = isAuthenticated;
    res.redirect('/urls');
  }
});
 
// endpoint to handle a POST to /logout in my Express server
// clear the current cookie that was generated before with the key: "user_id"
app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect('/login');
});
 
// POST app route that will allow the user to create a new custom URL to be saved in our database
// once we get the user id from the formt he user submitted, go to the database and check it exists, if not, redirect the user to login
app.post('/urls', (req, res) => {
  const id = req.session.user_id;
  const longUrl = req.body.longURL;
  const idIsExisting = idExists(id, users);
 
  if (idIsExisting) {
    const randomURLkey = generateRandomString();
    urlDatabase[randomURLkey] = { longURL: longUrl, userID: id };
    res.redirect(`/urls/${randomURLkey}`);
  } else {
    res.redirect('/login');
  }
});
 
// POST request to handle when user clicks on a url they wish to delete from: /urls/
// also has the ability to tell anyone in a browser or command line with curl to go away if they try access this route and do anything shady without a valid cookie
app.post('/urls/:shortURL/delete', (req, res) => {
  const id = req.session.user_id;
  const keyToDelete = req.params.shortURL;
  const idIsExisting = idExists(id, users);

  if (idIsExisting) {
    delete urlDatabase[keyToDelete];
    res.redirect('/urls');
  } else {
    res.send('You cant do that, go away \n');
  }
});
 
// post request from /urls/:shortURL to edit a existing url
// also has the ability to tell anyone in a browser or command line with curl to go away if they try access this route and do anything shady without a valid cookie
// https://stackoverflow.com/questions/6084858/javascript-use-variable-as-object-name
app.post('/urls/:shortURL', (req, res) => {
  const id = req.session.user_id;
  const shortUrl = req.params.shortURL;
  const longUrl = req.body.edit;
  const idIsExisting = idExists(id, users);

  if (idIsExisting) {
    urlDatabase[shortUrl] = { longURL: longUrl, userID: id };
    res.redirect(`/urls/${shortUrl}`);
  } else {
    res.send('You cant do that, go away \n');
  }
});

// get route to direct the user to the login page
app.get('/', (req, res) => {
  const id = req.session.user_id;
  const idIsExisting = idExists(id, users);

  if (idIsExisting) {
    res.redirect('/urls');
  } else {
    res.redirect('/login');
  }
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
  const id = req.session.user_id;
  const user = users[id];
  const idIsExisting = idExists(id, users);

  if (idIsExisting) {
    const filteredUrlDb = urlsForUser(id, urlDatabase);
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
  const id = req.session.user_id;
  const user = users[id];
  const idIsExisting = idExists(id, users);
 
  if (idIsExisting) {
    const templateVars = {urls: urlDatabase, user};
    res.render('urls_new', templateVars);
  } else {
    res.redirect('/login');
  }
});
 
// GET endpoint for short urls
// this app route also handles any redirects for when the user clicks on the 'edit' button in urls_index.js
app.get('/urls/:shortURL', (req, res) => {
  const id = req.session.user_id;
  const user = users[id];
  const longURL = urlDatabase[req.params.shortURL].longURL;
  const idIsExisting = idExists(id, users);
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: longURL,
    user
  };

  if (idIsExisting) {
    res.render('urls_show', templateVars);
  } else {
    res.redirect('/login');
  }
});

// GET endpoint to handle when the user clicks on a short url
app.get('/u/:shortURL', (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;

  if (longURL.includes('http')) {
    return res.redirect(longURL);
  } else {
    return res.redirect(`https://${longURL}`);
  }
});
 
// GET endpoint for urls.json
app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});
 
// GET 'edge case' endpoint to re-direct the user to my erros template, if they try access a route which doesnt exist
app.get('*', (req, res) => {
  const templateVars = {
    error: '404 not found!'
  };
  res.render('404', templateVars);
});
 
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
const bcrypt = require('bcrypt');

/* helper function that takes in req.body.email as "userEmail" and the users object, added hashing! much security!
   https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_objects/Object/values */
const passwordvalidator = function(userPassword, users, email) {
  for (const value of Object.values(users)) {

    const passwordMatches = bcrypt.compareSync(userPassword, value.hashedPassword);
    if (passwordMatches && email === value.email) {
      return value.id;
    }
  }
 
  return false;
};

// helper function to check if a users email address already exists in our database
const emailExists = function(userEmail, users) {
  let returnBool = false;
 
  for (const value of Object.values(users)) {
    if (value.email === userEmail) {
      returnBool = true;
    }
  }
 
  return returnBool;
};

// helper function to check if a users id already exists in our database
const isAuthenticated = function(userid, users) {
  let returnBool = false;
 
  for (const value of Object.values(users)) {
    if (value.id === userid) {
      returnBool = true;
    }
  }
 
  return returnBool;
};

/* helper function that will create a new 'copy' of the URLSdatabase, but only for the user that is currently logged in
   https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/entries */
const urlsForUser = function(userid, urlDatabase) {
  const returnUrls = {};
 
  for (const [key, value] of Object.entries(urlDatabase)) {
    if (value["userID"] === userid) {
      returnUrls[key] = {longURL: value["longURL"], userID: value["userID"] };
    }
  }
 
  return returnUrls;
};
 
/* helper function to generate a 6 char random string, this is not my own implementation, all credit goes to its creator:
   https://stackoverflow.com/questions/16106701/how-to-generate-a-random-string-of-letters-and-numbers-in-javascript */
const generateRandomString = function() {
  const textLen = 6;
  let text = "";
  let charset = "abcdefghijklmnopqrstuvwxyz0123456789";
  
  for (let i = 0; i < textLen; i++) {
    text += charset.charAt(Math.floor(Math.random() * charset.length));
  }
 
  return text;
};

// export these helper functions to where they are needed
module.exports = {passwordvalidator, emailExists, isAuthenticated, generateRandomString, urlsForUser};
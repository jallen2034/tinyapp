const { assert } = require('chai');

const { emailExists, idExists, urlsForUser } = require('../helpers.js');

// https://www.chaijs.com/api/assert/#method_istrue
const testUsers = {
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
};

const testUrlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "kajdhsakl" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" },
  i34cfg: { longURL: "https://www.abc.net.au", userID: "aJ48lW" }
};

describe('emailExists()', function() {
  it('emailExists() returns true when passed a valid email address, indicating this is a valid user in the Users object', function() {
    const user = emailExists("user@example.com", testUsers)
    // Write your assert statement here
    assert.isTrue(user, 'emailExists returns true');
  });
});

describe('emailExists()', function() {
  it('emailExists() returns false when passed a valid email address, indicating this user is not found in the Users object and is invalid', function() {
    const user = emailExists("hellothere@example.com", testUsers)
    // Write your assert statement here
    assert.isFalse(user, 'emailExists returns false');
  });
});

describe('idExists()', function() {
  it('idExists() returns true when passed a valid user_id, indicating this users user_id is found valid in the Users object', function() {
    const user = idExists("user2RandomID", testUsers)
    // Write your assert statement here
    assert.isTrue(user, 'idExists returns true');
  });
});

describe('idExists()', function() {
  it('idExists() returns false when passed a invalid user_id, indicating this users user_id is not found as valid in the Users object', function() {
    const user = idExists("IDtotallylegit", testUsers)
    // Write your assert statement here
    assert.isFalse(user, 'idExists returns false');
  });
});

// user is in database
describe('urlsForUser()', function() {
  it('urlsForUser() testing if able to find URLs for a particular user', function() {
    const urls = urlsForUser("aJ48lW", testUrlDatabase);
    const keys = Object.keys(urls);
    
    assert.deepEqual(keys, ['i3BoGr', 'i34cfg'], 'expectedOutput matches urls');
  });
});
const { assert } = require("chai");

const {generateRandomString, findUserByEmail, urlsForUser} = require("../helpers.js");

const users = {
  Egg: {
    id: "Egg",
    email: "egg@farm.com",
    password: "shell",
  },
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

const urlDatabase = {
  "b2xVn2": {longURL: "https://www.lighthouselabs.ca", userID: "egg315"},
  "9sm5xK": {longURL: "https://www.google.com", userID: "egg315"},
  "h0h0h0": {longURL: "https://www.dmoj.ca/", userID: "egg315"},
  "w0jb3k": {longURL: "https://www.facebook.com", userID: "egg400"}
};

describe("generateRandomString", function () {
  it("should generate a random string whose length is equal to its argument", function () {
    assert.equal(generateRandomString(6).length, 6);
  });
  it("should generate a random string whose length is equal to its argument", function () {
    assert.equal(generateRandomString(315).length, 315);
  });
  
});

describe("findUserByEmail", function () {
  it("should return a user with a valid email as an argument", function () {
    const user = findUserByEmail(users, "egg@farm.com");
    const expectedUserID = "Egg";
    assert.equal(user.id, expectedUserID);
  });
  it("should return undefined with an invalid email as an argument", function () {
    const user = findUserByEmail("steve@steve.com", users);
    assert.equal(user, undefined);
  });
});

describe("urlsForUser", function () {
  it("should return an object containing valid urls given a valid userID as an argument", function () {
    const userID = "egg400";
    const urls = {
      "w0jb3k": {
        longURL: "https://www.facebook.com",
        userID: "egg400"
      },
    };
    assert.deepEqual(urlsForUser(userID, urlDatabase), urls);
  });
  it("should return an empty object if the userID is not associated with any urls", function () {
    const userID = "ranch7";
    assert.deepEqual(urlsForUser(userID, urlDatabase), {});
  });
});
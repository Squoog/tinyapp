const express = require("express");
const cookieParser = require("cookie-parser");
const app = express();
const PORT = 8080;

app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

const users = {
  Egg: {
    username: "Egg",
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

const generateRandomString = function () {
  let randString = "";
  let characters = "abcdefghijklmnopqrstuvwxyz1234567890";
  for (let i = 0; i < 6; i++) {
    randString += characters.charAt(Math.floor(Math.random() * 36));
  }
  return randString;
};

const emailChecker = (expectedEmail, actualEmail) => {
  return (expectedEmail === actualEmail);
};

app.use(cookieParser());
app.use(express.urlencoded({
    extended: true,
  })
);

// Home page
app.get("/", (req, res) => {
  res.send("Hello!");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

// Test json
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.use(express.urlencoded({ extended: true }));

app.get("/urls", (req, res) => {
  const userID = req.cookies.user_id;
  const user = users[userID];

  let templateVars = {
    urls: urlDatabase,
    user
  };

  res.render("urls_index", templateVars);
});

// IMPORTANT: Keep this one before /urls/:id
app.get("/urls/new", (req, res) => {
  const userID = req.cookies.user_id;
  const user = users[userID];

  let templateVars = {
    user
  };
  res.render("urls_new", templateVars);
});

app.get('/urls/:shortURL', (req, res) => {
  const shortURL = req.params.shortURL;
  const userID = req.cookies.user_id;
  const user = users[userID];

  let templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[shortURL],
    user
  }
  res.render("urls_show", templateVars);
});

// Adds a new url
app.post("/urls", (req, res) => {
  console.log(req.body);
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect("/urls");
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

// Delete
app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});

// Edit
app.post("/urls/:shortURL", (req, res) => {
  const urlTag = req.params.shortURL;
  urlDatabase[urlTag] = req.body.longURL;
  console.log("Link edit");
  res.redirect("/urls");
});

app.post("/login", (req, res) => {
  let users = req.body.username;
  for (let id in users) {
    if (emailChecker(users[id].email, req.body.email) && users[id].password === req.body.password) {
      res.cookie('user_id', users[id].shortURL);
      res.redirect('/urls');
    }
  }
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("urls");
});

app.get("/register", (req, res) => {
  const userID = req.cookies.user_id;
  const user = users[userID];
  
  let templateVars = {
    user
  };
  res.render("urls_register", templateVars);
});

app.post("/register", (req, res) => {
  const randomID = generateRandomString();
  const user = {
    id: randomID,
    email: req.body.email,
    password: req.body.password,
  };

  for (let id in users) {
    if (req.body.email === "") {
      res.sendStatus(400);
      return;
    } else if (req.body.email === users[id].email) {
      res.sendStatus(400);
      return;
    }
  }

  users[randomID] = user;
  res.cookie("user_id", randomID);
  res.redirect("/urls");
});

app.get("/urls/:shortURL", (req, res) => { // still need?
  const userID = req.cookies.user_id;
  const user = users[userID];

  let templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    user
  };
  res.render("urls_show", templateVars);
});

app.get("/login", (req, res) => {
  const userID = req.cookies.user_id;
  const user = users[userID];

  let templateVars = {
    user,
  };

  res.render("urls_login", templateVars);
});

app.post("/login", (req, res) => {});